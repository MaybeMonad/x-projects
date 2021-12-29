import React, { useImperativeHandle } from 'react'
import {
  Control,
  FieldValues,
  FormState,
  useForm,
  UseFormGetValues,
  UseFormHandleSubmit,
  UseFormRegister,
  UseFormReset,
  UseFormSetValue,
  UseFormWatch
} from 'react-hook-form'
import styled from 'styled-components'

export interface FormProps<T = object> {
  /** DefaultValues */
  initialValue?: T

  /** Inline Styles */
  style?: React.CSSProperties

  /** Children */
  children: JSX.Element | JSX.Element[]

  /** On Submit Callback */
  onSubmit?: (data: T) => void

  /** On Submit Callback */
  onChange?: (data: T) => void
}

/* eslint-disable-next-line */
export interface FormRef {
  register: UseFormRegister<FieldValues>
  handleSubmit: UseFormHandleSubmit<FieldValues>
  watch: UseFormWatch<FieldValues>
  errors: {
    [x: string]: any
  }
  formState: FormState<FieldValues>
  control: Control<FieldValues, object>
  reset: UseFormReset<FieldValues>
  getValues: UseFormGetValues<FieldValues>
  setValues: (values: FieldValues) => void
  validateFields: (fields?: string[]) => Promise<boolean>
}

const StyledForm = styled.form``

const Form = React.forwardRef<FormRef, FormProps>((props, ref) => {
  const { onChange, onSubmit, children } = props
  const {
    register,
    handleSubmit,
    watch,
    formState,
    control,
    reset,
    getValues,
    setValue,
    trigger
  } = useForm()

  const form = {
    register,
    handleSubmit,
    watch,
    errors: formState.errors,
    formState,
    control,
    reset,
    getValues,
    setValues: (values: FieldValues) => {
      Object.keys(values).forEach(key => {
        setValue(key, values[key])
      })
    },
    validateFields: async (fields?: string[]) => {
      const result = await trigger(fields)

      return result
    }
  }

  useImperativeHandle(ref, () => ({
    ...form
  }))

  console.log('Children: ', children)

  const generateResolvedChildren = (children:  (JSX.Element | JSX.Element[]) & React.ReactNode): any => {
    return (children instanceof Array
      ? children
      : [children]
    ).map((child, index) => {
      return child instanceof Array ? generateResolvedChildren(child as JSX.Element[]) : React.isValidElement(child)
        ? React.cloneElement(child, {
            ...(child.props as any),
            key: index.toString(),
            form
          })
        : child
    })
  }

  const resolvedChildren =generateResolvedChildren(children)

  console.log('Resolved Children: ', resolvedChildren)

  return (
    <StyledForm onSubmit={handleSubmit(onSubmit ?? console.log)}>
      {resolvedChildren}
    </StyledForm>
  )
})

export { Form }

export default Form
