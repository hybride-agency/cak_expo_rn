import {mergeAuthResponseWithProfile} from '../src/utils/authSession';

describe('mergeAuthResponseWithProfile', () => {
  it('replaces a stale missing-plan session with the current active plan', () => {
    const refreshed = mergeAuthResponseWithProfile(
      {
        data: {
          token: 'old-token',
          user: {id: 42, has_active_plan: false},
          active_plan: undefined,
          homepage_access: {
            can_access_homepage: false,
            blocking_codes: ['missing_subscription'],
          },
        },
      },
      {
        data: {
          user: {id: 42, has_active_plan: true},
          active_plan: {name: 'meal'},
          homepage_access: {
            can_access_homepage: true,
            blocking_codes: [],
            active_plan_alias: 'meal',
          },
        },
      },
      {token: 'current-token', action_plan: 'meal'},
    );

    expect(refreshed.data).toMatchObject({
      token: 'current-token',
      action_plan: 'meal',
      user: {id: 42, has_active_plan: true},
      active_plan: {name: 'meal'},
      homepage_access: {
        can_access_homepage: true,
        blocking_codes: [],
      },
    });
  });
});
