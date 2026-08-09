import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import {Image} from 'expo-image';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import { SCREEN_PADDING } from '../../../theme';
import Arrow_Back_Logo_SVG from '../../../assets/SVG/Arrow_Back_Logo_SVG';
import type {QuestionStackParamList} from '../../navigation/QuestionStack';
import {
  AgePickerCmp,
  DropDownPickerCmp,
  GenderPickerCmp,
  MultiSelectionPickerCmp,
  RadioButtonCmp,
  SecondaryButtonCmp,
  WeightPickerCmp,
  ProgressBar,
} from '../../components';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  getQuestionByGender,
  submitAnswer,
} from '../../slice/QuestionSlice';
import HeightPickerCmp from '../../components/HeightPickerCmp';
import { SubmitAnswer, SubmitAnswerResponse } from '../../../global';
import {toggleMultiSelectAnswer} from '../../utils/quizSelections';

type Gender = 'm' | 'f';

type QuizAnswer = {
  id: number | string;
  title: string;
  image_url?: string | null;
  order?: number;
  is_exclusive?: boolean;
};

type QuizQuestion = {
  id: number;
  quiz_id?: number;
  category_id?: number | null;
  current_category?: number | null;
  total_categories?: number | null;
  image_url?: string | null;
  title?: string;
  description?: string | null;
  type?: string;
  alias?: string | null;
  answers?: QuizAnswer[];
  has_follow_up_question?: number;
  follow_up_question_id?: number | null;
  follow_up_question?: QuizQuestion | null;
  [key: string]: unknown;
};

type QuizData = {
  id?: number;
  questions?: QuizQuestion[];
  [key: string]: unknown;
};

const GENDER_QUESTION_ID = 1;
const DEFAULT_TOTAL_CATEGORY_STEPS = 6;
const GENDERS: Gender[] = ['m', 'f'];

const isGender = (gender: string): gender is Gender =>
  gender === 'm' || gender === 'f';

const getQuizDataFromPayload = (payload: unknown): QuizData | null => {
  if (!payload || typeof payload !== 'object') return null;
  const data = (payload as {data?: unknown}).data;
  return data && typeof data === 'object' ? (data as QuizData) : null;
};

const flattenQuestions = (questions: QuizQuestion[] = []) => {
  const flattened: QuizQuestion[] = [];

  const visit = (question?: QuizQuestion | null) => {
    if (!question) {
      return;
    }

    flattened.push(question);
    visit(question.follow_up_question);
  };

  questions.forEach(visit);
  return flattened;
};

const getTotalCategorySteps = (questions: QuizQuestion[] = []) => {
  if (!questions.length) {
    return DEFAULT_TOTAL_CATEGORY_STEPS;
  }

  const flattenedQuestions = flattenQuestions(questions);
  const uniqueCategoryIds = new Set(
    flattenedQuestions
      .map(question => question.category_id)
      .filter(categoryId => categoryId !== null && categoryId !== undefined),
  );
  const serverTotal = flattenedQuestions.reduce((maxTotal, question) => {
    const totalCategories = Number(question.total_categories) || 0;
    return Math.max(maxTotal, totalCategories);
  }, 0);

  return Math.max(serverTotal, uniqueCategoryIds.size, 1);
};

const getCategoryStepIndex = (
  currentQuestion: QuizQuestion | null,
  questions: QuizQuestion[],
  totalSteps: number,
) => {
  if (!currentQuestion) {
    return -1;
  }

  const serverCategory = Number(currentQuestion.current_category);

  if (serverCategory > 0) {
    return Math.min(serverCategory - 1, totalSteps - 1);
  }

  const categoryIds: (number | string)[] = [];

  flattenQuestions(questions).forEach(questionItem => {
    const categoryId = questionItem.category_id;

    if (
      categoryId !== null &&
      categoryId !== undefined &&
      !categoryIds.includes(categoryId)
    ) {
      categoryIds.push(categoryId);
    }
  });

  const categoryIndex =
    currentQuestion.category_id === null ||
    currentQuestion.category_id === undefined
      ? -1
      : categoryIds.indexOf(currentQuestion.category_id);
  return categoryIndex >= 0 ? Math.min(categoryIndex, totalSteps - 1) : 0;
};

const getConnectorProgress = (
  currentQuestion: QuizQuestion | null,
  questions: QuizQuestion[],
  currentStep: number,
  totalSteps: number,
) => {
  if (!currentQuestion || currentStep < 0 || currentStep >= totalSteps - 1) {
    return 0;
  }

  const categoryQuestions = flattenQuestions(questions).filter(
    questionItem => questionItem.category_id === currentQuestion.category_id,
  );
  const questionIndexInCategory = Math.max(
    categoryQuestions.findIndex(
      questionItem => questionItem.id === currentQuestion.id,
    ),
    0,
  );

  if (currentStep === 0) {
    return Math.min(
      (questionIndexInCategory + 1) / Math.max(categoryQuestions.length, 1),
      1,
    );
  }

  return Math.min(
    questionIndexInCategory / Math.max(categoryQuestions.length - 1, 1),
    1,
  );
};

const QuestionListView = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<QuestionStackParamList>>();
  const dispatch = useAppDispatch();

  const { loading } = useAppSelector(state => state.question);

  const [title] = useState<string>('Let’s get to know you');
  const [description] = useState<string>('1-minute Quiz');
  const [question, setQuestion] = useState<QuizQuestion[] | null>(null);
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [answer, setAnswer] = useState<SubmitAnswer[]>([]);
  const [showNextButton, setShowNextButton] = useState<boolean>(false);
  const [currentDisplayQuestion, setCurrentDisplayQuestion] =
    useState<QuizQuestion | null>(null);
  const [questionStack, setQuestionStack] = useState<QuizQuestion[]>([]);
  const [submitAnswerResponse, setSubmitAnswerResponse] =
    useState<SubmitAnswerResponse | null>(null);
  const [submbitted, setSubmbitted] = useState<boolean>(false);
  const [, setTdee] = useState<number>(0);
  const [selectedGender, setSelectedGender] = useState<Gender | null>(null);
  const [questionsByGender, setQuestionsByGender] = useState<
    Partial<Record<Gender, QuizData>>
  >({});
  const [selectedQuizId, setSelectedQuizId] = useState<number>(1);
  const [isPreparingQuestions, setIsPreparingQuestions] =
    useState<boolean>(false);
  const quizRequestByGender = useRef<
    Partial<Record<Gender, Promise<QuizData | null>>>
  >({});
  const prefetchImages = useCallback((questions: QuizQuestion[]) => {
    const urls = new Set<string>();

    const collectQuestionImages = (questionItem?: QuizQuestion | null) => {
      if (!questionItem) {
        return;
      }

      if (questionItem.image_url) {
        urls.add(questionItem.image_url);
      }

      questionItem.answers?.forEach(answerItem => {
        if (answerItem.image_url) {
          urls.add(answerItem.image_url);
        }
      });

      collectQuestionImages(questionItem.follow_up_question);
    };

    questions.forEach(collectQuestionImages);

    if (urls.size) {
      // memory-disk keeps the decoded bitmap warm, not just the file on
      // disk, so the <Image> below paints instantly with no pop-in/flash
      // when its screen becomes current.
      Image.prefetch(Array.from(urls), 'memory-disk');
    }
  }, []);

  const fetchQuizForGender = useCallback(
    (gender: Gender, silent = true) => {
      const existingRequest = quizRequestByGender.current[gender];

      if (existingRequest) {
        return existingRequest;
      }

      const request = dispatch(getQuestionByGender({ gender, silent })).then(
        result => {
          if (getQuestionByGender.fulfilled.match(result)) {
            const quizData = getQuizDataFromPayload(result.payload);
            const questions = quizData?.questions || [];

            setQuestionsByGender(prevQuestionsByGender => ({
              ...prevQuestionsByGender,
              [gender]: quizData || { questions },
            }));
            prefetchImages(questions);

            return quizData;
          }

          delete quizRequestByGender.current[gender];
          return null;
        },
      );

      quizRequestByGender.current[gender] = request;
      return request;
    },
    [dispatch, prefetchImages],
  );

  useEffect(() => {
    GENDERS.forEach(gender => {
      fetchQuizForGender(gender, true);
    });
  }, [fetchQuizForGender]);

  const setGenderAnswer = useCallback((gender: Gender) => {
    setAnswer([
      {
        question_id: GENDER_QUESTION_ID,
        answer_values: [gender],
      },
    ]);
  }, []);

  const handleGenderPreview = useCallback(
    (gender: string) => {
      if (!isGender(gender)) {
        return;
      }

      setSelectedGender(gender);
      setGenderAnswer(gender);
    },
    [setGenderAnswer],
  );

  // Get the current question to display (either main question or follow-up)
  const getCurrentQuestion = useCallback(() => {
    return (
      currentDisplayQuestion || (question ? question[questionIndex] : null)
    );
  }, [currentDisplayQuestion, question, questionIndex]);

  const progressState = useMemo(() => {
    const cachedQuestions = selectedGender
      ? questionsByGender[selectedGender]?.questions || []
      : [];
    const progressQuestions = question || cachedQuestions;
    const totalSteps = getTotalCategorySteps(progressQuestions);

    if (!selectedGender && !question) {
      return {
        currentStep: -1,
        connectorProgress: 0,
        totalSteps,
      };
    }

    if (!question) {
      return {
        currentStep: 0,
        connectorProgress: 0,
        totalSteps,
      };
    }

    const currentQuestion = getCurrentQuestion();
    const currentStep = getCategoryStepIndex(
      currentQuestion,
      question,
      totalSteps,
    );

    return {
      currentStep,
      connectorProgress: getConnectorProgress(
        currentQuestion,
        question,
        currentStep,
        totalSteps,
      ),
      totalSteps,
    };
  }, [getCurrentQuestion, question, questionsByGender, selectedGender]);

  const currentQuestion = getCurrentQuestion();
  const backgroundImageUrl = question ? currentQuestion?.image_url : null;

  // Check if current question should hide next button and auto-advance
  const shouldAutoAdvance = () => {
    const currentQuestion = getCurrentQuestion();
    return (
      currentQuestion &&
      currentQuestion.type === 'radio-button' &&
      (currentQuestion.alias === null ||
        (currentQuestion.alias && currentQuestion.alias.includes('-1')))
    );
  };

  // Dropdown questions are required server-side (a submission with an empty
  // answer_values for one is rejected), and unlike radio/multi-select there
  // is no "none of the above" option, so block Next until something's picked.
  const isNextDisabled = () => {
    const currentQuestion = getCurrentQuestion();

    if (currentQuestion?.type !== 'dropdown') {
      return false;
    }

    const currentAnswer = answer.find(
      ans => ans.question_id === currentQuestion.id,
    );
    return !currentAnswer || currentAnswer.answer_values.length === 0;
  };

  // Function to handle next question logic
  const goToNextQuestion = async () => {
    if (!question?.length) {
      return;
    }

    if (questionIndex === question.length - 1) {
      console.log('answer', JSON.stringify(answer));
      // It's the last question, submit the answers
      try {
        const quiz_id = selectedQuizId || currentQuestion?.quiz_id || 1;
        const result = await dispatch(
          submitAnswer({
            quiz_id,
            answers: answer,
          }),
        );
        if (submitAnswer.fulfilled.match(result)) {
          console.log('Submit answer successful!', result?.payload);
          setSubmitAnswerResponse(result?.payload?.data);
          setSubmbitted(true);
          setTdee(result?.payload?.data?.tdee_per_day);
          // Handle successful submission (e.g., navigate to results or next screen)
        }
      } catch (error) {
        console.error('Failed to submit answers:', error);
      }
    } else {
      setQuestionIndex(questionIndex + 1);
      setCurrentDisplayQuestion(null); // Clear follow-up question when moving to next question
      setQuestionStack([]); // Clear question stack
    }
  };

  const updateAnswer = (questionId: number, answerValues: string[]) => {
    setAnswer(prevAnswers => {
      const existingAnswerIndex = prevAnswers.findIndex(
        ans => ans.question_id === questionId,
      );

      const newAnswer = {
        question_id: questionId,
        answer_values: answerValues,
      };

      if (existingAnswerIndex >= 0) {
        // Update existing answer
        const updatedAnswers = [...prevAnswers];
        updatedAnswers[existingAnswerIndex] = newAnswer;
        // console.log('updatedAnswers', updatedAnswers);
        return updatedAnswers;
      } else {
        // Add new answer
        // console.log('all answers', [...prevAnswers, newAnswer]);
        return [...prevAnswers, newAnswer];
      }
    });
  };

  const renderAnswer = () => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return <View />;

    switch (currentQuestion?.type) {
      case 'age':
        return (
          <AgePickerCmp
            onSelectAge={(age: number) => {
              updateAnswer(currentQuestion?.id, [String(age)]);
            }}
          />
        );
      case 'height':
        return (
          <HeightPickerCmp
            onSelectHeight={(height: number) => {
              updateAnswer(currentQuestion?.id, [String(height)]);
            }}
          />
        );
      case 'weight':
        return (
          <WeightPickerCmp
            onSelectWeight={(weight: number) => {
              updateAnswer(currentQuestion?.id, [String(weight)]);
            }}
          />
        );
      case 'radio-button':
        return (
          <View>
            <FlatList
              data={currentQuestion?.answers ?? []}
              keyExtractor={item => item.id.toString()}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={{ height: 15 }} />}
              renderItem={({ item }) => (
                <RadioButtonCmp
                  title={item.title}
                  item={item}
                  onPress={(selectedItem, title) => {
                    updateAnswer(currentQuestion?.id, [
                      selectedItem.id.toString(),
                    ]);

                    // Check if this question has follow-up and the selected answer is "Yes" or "Other"
                    if (
                      currentQuestion?.has_follow_up_question === 1 &&
                      (title === 'Yes' || title === 'Other') &&
                      currentQuestion?.follow_up_question
                    ) {
                      // Replace current question with follow-up question
                      const followUpQuestion =
                        currentQuestion.follow_up_question;
                      setQuestionStack(prev => [...prev, currentQuestion]); // Save current question to stack
                      setCurrentDisplayQuestion(followUpQuestion); // Replace with follow-up
                    } else if (shouldAutoAdvance()) {
                      // Auto-advance to next question if alias contains '-1' and type is radio-button
                      setTimeout(() => {
                        goToNextQuestion();
                      }, 100); // Small delay to show selection feedback
                    }
                  }}
                  isSelected={answer.some(
                    ans =>
                      ans.question_id === currentQuestion?.id &&
                      ans.answer_values.includes(item.id.toString()),
                  )}
                  isFollowUp={!!currentDisplayQuestion}
                  follow_up_question_id={currentQuestion?.follow_up_question_id}
                />
              )}
            />
          </View>
        );

      case 'dropdown':
        return (
          <View style={styles.dropdownContainer}>
            <DropDownPickerCmp
              data={currentQuestion?.answers ?? []}
              onSelectionChange={(selectedIds: string[]) => {
                updateAnswer(currentQuestion?.id, selectedIds);
              }}
            />
          </View>
        );
      case 'multi-select':
        return (
          <View style={styles.multiSelectContainer}>
            <FlatList
              data={currentQuestion?.answers}
              keyExtractor={item => item.id.toString()}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={{ height: 15 }} />}
              renderItem={({ item }) => (
                <MultiSelectionPickerCmp
                  title={item.title}
                  item={item}
                  onPress={(selectedItem, title) => {
                    // Get current answers for this question
                    const currentAnswerForQuestion = answer.find(
                      ans => ans.question_id === currentQuestion?.id,
                    );
                    const currentAnswerValues =
                      currentAnswerForQuestion?.answer_values || [];

                    const newAnswerValues = toggleMultiSelectAnswer(
                      currentAnswerValues,
                      selectedItem,
                      currentQuestion.answers ?? [],
                    );

                    updateAnswer(currentQuestion?.id, newAnswerValues);

                    // Check if this question has follow-up and the selected answer is "Yes" or "Other"
                    if (
                      currentQuestion?.has_follow_up_question === 1 &&
                      (title === 'Yes' || title === 'Other') &&
                      currentQuestion?.follow_up_question
                    ) {
                      // Replace current question with follow-up question
                      const followUpQuestion =
                        currentQuestion.follow_up_question;
                      setQuestionStack(prev => [...prev, currentQuestion]); // Save current question to stack
                      setCurrentDisplayQuestion(followUpQuestion); // Replace with follow-up
                    }
                  }}
                  isSelected={answer.some(
                    ans =>
                      ans.question_id === currentQuestion?.id &&
                      ans.answer_values.includes(item.id.toString()),
                  )}
                  isFollowUp={!!currentDisplayQuestion}
                />
              )}
            />
          </View>
        );
      default:
        return <View />;
    }
  };

  const handleInfoAnswers = async (type: string, gender: string) => {
    if (type !== 'gender' || !isGender(gender)) {
      return;
    }

    setSelectedGender(gender);
    setGenderAnswer(gender);
    setIsPreparingQuestions(true);
    setQuestionIndex(0);
    setCurrentDisplayQuestion(null);
    setQuestionStack([]);

    const quizData =
      questionsByGender[gender] || (await fetchQuizForGender(gender, false));
    const questions = quizData?.questions || [];

    if (questions.length) {
      setSelectedQuizId(quizData?.id || questions[0]?.quiz_id || 1);
      setQuestion(questions);
      setShowNextButton(true);
      prefetchImages(questions);
    }

    setIsPreparingQuestions(false);
  };

  return (
    <View style={styles.container}>
      {loading || isPreparingQuestions ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#68FE00" />
        </View>
      ) : submbitted ? (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setSubmbitted(false);
                }}
              >
                <Arrow_Back_Logo_SVG />
              </TouchableOpacity>
              <View style={styles.progressBarContainer}>
                <ProgressBar
                  currentStep={progressState.totalSteps - 1}
                  totalSteps={progressState.totalSteps}
                  connectorProgress={1}
                  showCompletedChecks
                />
              </View>
            </View>

            <View
              style={[
                styles.titleContainer,
                {
                  marginBottom: 0,
                },
              ]}
            >
              <Text style={styles.title}>TDEE</Text>
              <Text
                style={[
                  styles.description,
                  {
                    fontFamily: 'Raleway-Light',
                  },
                ]}
              >
                Total daily Energy Expenditure
              </Text>
            </View>

            <View style={styles.tdeeContainer}>
              <Text style={styles.tdeeTitle}>
                Your TDEE is <Text style={styles.tdeeValue}>****</Text> calories
                per day.
              </Text>
            </View>

            <View style={styles.tdeeValueContainer}>
              <View style={styles.tdeeValueTitleContainer}>
                <Text style={styles.tdeeValueTitle}>
                  Activity level
                </Text>
                <Text style={[styles.tdeeValueTitle, styles.tdeeValueTitleRight]}>
                  Calories Per Day
                </Text>
              </View>

              <View style={styles.tdeeValueItemContainer}>
                {submitAnswerResponse?.tdee_calculations?.map((item, index) => (
                  <View
                    key={index}
                    style={[
                      styles.tdeeValueItem,
                      {
                        borderWidth: item.is_selected ? 2 : 0,
                        borderColor: item.is_selected
                          ? '#68FE00'
                          : 'transparent',
                        paddingHorizontal: item.is_selected ? 18 : 0,
                        paddingVertical: item.is_selected ? 7 : 0,
                        backgroundColor: item.is_selected
                          ? '#2A2A2A'
                          : 'transparent',
                        borderRadius: 32,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.tdeeValueItemTitle,
                        item.is_selected && styles.tdeeSelectedText,
                      ]}
                    >
                      {item.activity_level}
                    </Text>
                    <Text
                      style={[
                        styles.tdeeValueItemValue,
                        item.is_selected && styles.tdeeSelectedText,
                      ]}
                    >
                      {item.tdee} kcal
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <Text style={styles.tdeeFooterText}>
              We’ll use this number to design your custom nutrition and training
              plan.
            </Text>

            <View style={styles.buttonContainer2}>
              <SecondaryButtonCmp
                text="Next"
                onPress={() => {
                  navigation.navigate('Generate');
                }}
              />
            </View>
          </View>
        </SafeAreaView>
      ) : (
        <>
          {backgroundImageUrl && (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: backgroundImageUrl }}
                style={styles.image}
                cachePolicy="memory-disk"
                transition={0}
              />
            </View>
          )}

          <SafeAreaView
            style={styles.safeArea}
            edges={['top', 'left', 'right']}
          >
            <View style={styles.content}>
              <View style={styles.iconContainer}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => {
                    // If we have follow-up questions in the stack, go back to previous question
                    if (questionStack.length > 0) {
                      const previousQuestion =
                        questionStack[questionStack.length - 1];
                      setCurrentDisplayQuestion(previousQuestion);
                      setQuestionStack(prev => prev.slice(0, -1)); // Remove last question from stack
                    } else if (currentDisplayQuestion) {
                      // If we're on a follow-up question but no stack, go back to main question
                      setCurrentDisplayQuestion(null);
                    } else if (questionIndex > 0) {
                      // Regular navigation back to previous main question
                      setQuestionIndex(questionIndex - 1);
                      setCurrentDisplayQuestion(null);
                      setQuestionStack([]);
                    } else {
                      // Go back to gender selection
                      setQuestion(null);
                      setShowNextButton(false);
                      setCurrentDisplayQuestion(null);
                      setQuestionStack([]);
                      setQuestionIndex(0);
                      if (selectedGender) {
                        setGenderAnswer(selectedGender);
                      } else {
                        setAnswer([]);
                      }
                    }
                    // navigation.goBack();
                  }}
                >
                  <Arrow_Back_Logo_SVG />
                </TouchableOpacity>
                <View style={styles.progressBarContainer}>
                  <ProgressBar
                    currentStep={progressState.currentStep}
                    totalSteps={progressState.totalSteps}
                    connectorProgress={progressState.connectorProgress}
                  />
                </View>
              </View>

              {!question ? (
                <>
                  <View style={styles.titleContainer}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.description}>
                      {description ? description : ''}
                    </Text>
                  </View>
                  <View style={styles.questionContainer}>
                    <GenderPickerCmp
                      selectedGender={selectedGender}
                      onChangeGender={handleGenderPreview}
                      onSelectGender={gender => {
                        handleInfoAnswers('gender', gender);
                      }}
                    />
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.titleContainer}>
                    <Text style={styles.title}>
                      {getCurrentQuestion()?.title}
                    </Text>
                    <Text style={styles.description}>
                      {getCurrentQuestion()?.description
                        ? getCurrentQuestion()?.description
                        : ''}
                    </Text>
                  </View>
                  <View style={styles.questionContainer}>{renderAnswer()}</View>
                </>
              )}

              {showNextButton && !shouldAutoAdvance() && (
                <View style={styles.buttonContainer}>
                  <SecondaryButtonCmp
                    text="Next"
                    disabled={isNextDisabled()}
                    onPress={() => {
                      goToNextQuestion();
                    }}
                  />
                </View>
              )}
            </View>
          </SafeAreaView>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#171717',
    position: 'relative',
  },
  safeArea: {
    flex: 1,
    zIndex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: SCREEN_PADDING.left,
    position: 'relative',
  },
  closeButton: {},
  iconContainer: {
    marginTop: 22,
    marginBottom: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  progressBarContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleContainer: {
    gap: 6,
    marginBottom: 111,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Raleway-Bold',
    color: '#fff',
    includeFontPadding: false,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    fontFamily: 'Raleway-Medium',
    color: '#fff',
    includeFontPadding: false,
  },
  questionContainer: {},
  loadingContainer: {
    paddingTop: 67,
  },
  buttonContainer: {
    // position: 'absolute',
    marginVertical: 53,
    // left: 0,
    // right: 0,
    paddingHorizontal: SCREEN_PADDING.left,
    alignItems: 'center',
  },
  buttonContainer2: {
    position: 'absolute',
    bottom: 53,
    left: 0,
    right: 0,
    paddingHorizontal: SCREEN_PADDING.left,
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  dropdownContainer: {
    marginTop: -110,
  },
  multiSelectContainer: {
    marginTop: -75,
  },
  tdeeContainer: {
    marginTop: 52,
    marginBottom: 58,
    alignItems: 'center',
  },
  tdeeTitle: {
    fontSize: 16,
    fontFamily: 'Raleway-Bold',
    color: '#fff',
    includeFontPadding: false,
  },
  tdeeValue: {
    color: '#68FE00',
  },
  tdeeValueTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  tdeeValueTitle: {
    fontSize: 16,
    fontFamily: 'Raleway-Bold',
    color: '#fff',
    includeFontPadding: false,
    flex: 1,
    textAlign: 'left',
  },
  tdeeValueTitleRight: {
    textAlign: 'right',
  },
  tdeeValueContainer: {
    marginBottom: 0,
    paddingHorizontal: 22,
  },
  tdeeValueItemContainer: {
    gap: 14,
  },
  tdeeValueItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tdeeValueItemTitle: {
    fontSize: 16,
    fontFamily: 'Raleway-ExtraLight',
    color: '#fff',
    includeFontPadding: false,
    flex: 1.5,
    textAlign: 'left',
  },
  tdeeValueItemValue: {
    fontSize: 16,
    fontFamily: 'Raleway-ExtraLight',
    color: '#fff',
    includeFontPadding: false,
    flex: 1,
    textAlign: 'right',
    marginLeft: 15,
  },
  tdeeSelectedText: {
    color: '#68FE00',
    fontFamily: 'Raleway-Bold',
  },
  tdeeFooterText: {
    marginTop: 72,
    paddingHorizontal: 28,
    fontSize: 16,
    fontFamily: 'Raleway-ExtraLight',
    color: '#fff',
    includeFontPadding: false,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default QuestionListView;
