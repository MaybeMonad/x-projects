import { act, renderHook } from '@testing-library/react-hooks';
import useRequest from './use-request';

describe('useRequest', () => {
  it('should render successfully', () => {
    const { result } = renderHook(() => useRequest());

    expect(result.current.count).toBe(0);

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });
});
