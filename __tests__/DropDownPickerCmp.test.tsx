import React from 'react';
import {fireEvent, render} from '@testing-library/react-native';

import DropDownPickerCmp from '../src/components/DropDownPickerCmp';

describe('DropDownPickerCmp', () => {
  it('notifies only when selection changes, even when the parent callback changes', async () => {
    const firstSelectionHandler = jest.fn();
    const data = [
      {id: 1, title: 'Concern A'},
      {id: 2, title: 'Concern B'},
    ];
    const view = await render(
      <DropDownPickerCmp
        data={data}
        onSelectionChange={firstSelectionHandler}
      />,
    );

    await fireEvent.press(view.getByText('Concern A'));

    expect(firstSelectionHandler).toHaveBeenCalledTimes(1);
    expect(firstSelectionHandler).toHaveBeenLastCalledWith(['1']);

    const latestSelectionHandler = jest.fn();
    await view.rerender(
      <DropDownPickerCmp
        data={data}
        onSelectionChange={latestSelectionHandler}
      />,
    );

    expect(latestSelectionHandler).not.toHaveBeenCalled();

    await fireEvent.press(view.getByText('Concern B'));

    expect(latestSelectionHandler).toHaveBeenCalledTimes(1);
    expect(latestSelectionHandler).toHaveBeenLastCalledWith(['1', '2']);
  });
});
