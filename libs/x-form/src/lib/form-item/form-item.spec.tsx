import { render } from '@testing-library/react';

import FormItem from './form-item';

describe('FormItem', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<FormItem />);
    expect(baseElement).toBeTruthy();
  });
});
