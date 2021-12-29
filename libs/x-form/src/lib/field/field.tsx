import React from 'react'
import {
  FieldValues,
  UseFormRegister,
  Controller,
  Control,
  ControllerRenderProps,
  Validate
} from 'react-hook-form'
import styled, { css } from 'styled-components'

export interface Vlidation extends Object {
  required?: boolean | string
  pattern?:
    | RegExp
    | {
        value: RegExp
        message: string
      }
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  validate?: ((value: any) => boolean) | Validate<any>
}

export interface FormInstanceProps {
  register?: UseFormRegister<FieldValues>
  control?: Control<FieldValues, object>
  errors?: {
    [x: string]: any
  }
}

/* eslint-disable-next-line */
export interface FieldProps {
  name?: string
  form?: FormInstanceProps
  validate?: Vlidation
  defaultValue?: React.ReactText | FieldValues | boolean
  children: React.ReactElement
}

const StyledField = styled.div<{
  hasError: boolean
}>`
  ${props =>
    props.hasError &&
    css`
      input {
        --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 1px red;
        --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 1px red;
        box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow),
          var(--tw-shadow, 0 0 #0000);
      }
    `}
`

export function FieldComponent (props: FieldProps) {
  const { name, children, form, defaultValue, validate = {}, ...rest } = props
  const { register, control, errors } = form ?? {}

  if (!name) {
    console.error('Parameter name is needed for Form Field Component.')
  }

  console.log('Field Children: ', children)

  const generateControlledComponent = (
    field: ControllerRenderProps<FieldValues, string>
  ) => {
    return React.isValidElement(children) && name && register
      ? React.cloneElement(children, {
          ...(children.props as any),
          ...field,
          onChange: (value: any) => {
            ;(children.props as any)?.onChange?.(value)
            field.onChange(value)
          }
        })
      : children
  }

  // console.log('Field Props: ', props)

  // console.log('Errors: ', errors)

  if (!control)
    console.error(
      'MISSING: control field is needed. Plz make sure your FormItem is not nested.'
    )

  return (
    <StyledField hasError={!!errors?.[name ?? '']}>
      {name && control && (
        <Controller
          name={name}
          control={control}
          defaultValue={defaultValue}
          rules={validate}
          render={({ field }) => generateControlledComponent(field)}
        />
      )}
    </StyledField>
  )
}

const Field = React.memo(FieldComponent)

export { Field }
export default Field
