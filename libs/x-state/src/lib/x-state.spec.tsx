import { render } from '@testing-library/react';

import XState from './x-state';

describe('XState', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<XState />);
    expect(baseElement).toBeTruthy();
  });
});
