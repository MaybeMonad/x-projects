import React from 'react'
import { Control, FieldValues, UseFormRegister } from 'react-hook-form'
import styled from 'styled-components'
import clsx from 'clsx'
import Field, { FormInstanceProps, Vlidation } from '../field/field'
import { ErrorMessage } from '../error-message/error-message'

export interface FormItemProps {
  className?: string
  name?: string
  label?: string | React.ReactElement
  layout?: 'horizontal' | 'vertical'
  form?: FormInstanceProps
  defaultValue?: React.ReactText | FieldValues | boolean
  validate?: Vlidation
  children: React.ReactElement
}

const StyledFormItem = styled.div`
  margin-bottom: 4px;

  .form-field {
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;

    &.vertical {
      flex-direction: column;
    }

    &.horizontal {
      align-items: center;
    }
  }
`

export function FormItemComponent (props: FormItemProps) {
  const {
    name,
    form,
    defaultValue,
    validate,
    className,
    label,
    layout = 'vertical',
    ...rest
  } = props

  return (
    <StyledFormItem className={className}>
      <div className={clsx('form-field', layout)}>
        {React.isValidElement(label) ? label : <label>{label}</label>}
        <Field
          {...{
            name,
            form,
            defaultValue,
            validate
            // ...rest
          }}
        >
          {props.children}
        </Field>
      </div>
      {validate && <ErrorMessage {...{ errors: form?.errors?.[name ?? ''] }} />}
    </StyledFormItem>
  )
}

const FormItem = React.memo(FormItemComponent)

export { FormItem }
export default FormItem
