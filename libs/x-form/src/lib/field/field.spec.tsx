import { render } from '@testing-library/react';

import Field from './field';

describe('Field', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Field />);
    expect(baseElement).toBeTruthy();
  });
});
