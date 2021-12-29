# x-form

## Intro

`@rw-finance/form` 是基于业内“性能第一”的 React 表单解决方案 ——
React Hook Form
封装的（好不好用大家一起来检验，后期我可能会随时替换都有可能，但会尽量保证
API 一致，绝不会像 🐧 那样说废弃 API
就废弃，以不影响大家正常使用为前提进行升级改造。）

API 有点类似 Ant Design Form，但会更精简、更灵活，比如我们可以用
FormItem 来操作受控行为，

```tsx
<FormItem
  name='username'
  defaultValue='Username'
  validate={{ required: '用户名不能为空' }}
>
  <Input />
</FormItem>
```

也可以用 Field 和 ErrorMessage 来自由组合。

```tsx
  <Field
    name='username'
    defaultValue='Username'
    validate={{ required: '用户名不能为空' }}
  >
    <Input />
  </Field>
  <ErrorMessage errorFor='username' />
```

## `<Form />` APIs

```tsx
interface FormProps<T = {}> {
  defaultValue?: T
  onSubmit?:
}

<Form
  defaultValue={{}}
>

</Form>
```

## APIs for FormItem

`<FormItem />` is a combination of `<Field>` and
`<ErrorMessage>`. What you can get from `<FormItem>` is that
with simple APIs similar to Ant Design&apos;s `<Form.Item>`, it
can save you time to organize form structures in common scenarios.
When you encounter complex situations, you can still have the full
control over the FORM by applying `<Field>` and
`<ErrorMessage>`.

```tsx
interface FormItemProps<T = {}> {
  defaultValue?: T
  onSubmit?:
}

<Form
  defaultValue={{}}
>

</Form>
```

## APIs for Field

```tsx
interface FieldProps<T = {}> {
  defaultValue?: T
  onSubmit?:
}

<Form
  defaultValue={{}}
>

</Form>
```

## APIs for ErrorMessage

```tsx
interface FormItemProps<T = {}> {
  defaultValue?: T
  onSubmit?:
}

<Form
  defaultValue={{}}
>

</Form>
```
