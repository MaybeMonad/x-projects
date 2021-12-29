# x-hooks

React Hooks

- **useRequest** -> XState based data-fetching state management tool.

```tsx
import { useRequest } from '@x-projects/x-hooks'

const service = axios.get('xx-api')
const options = {
  initialData: '',
  defaultParams: {},
  manual: true,
  formatResult: res => {
    return res.data
  },
  onSuccess: (result, params) => {
    // Do something with the formatted result...
  },
  onFail: error => console.log(error),
  onRefetch: () => void
}

const { data, loading, run, refetch } = useRequest(service, options)
```
