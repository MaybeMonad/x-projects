import React from 'react'
import styled from 'styled-components'
import { FormRef } from '../form'

/* eslint-disable-next-line */
export interface ErrorMessageProps {
  errors?: any
  errorFor?: string
  form?: FormRef
}

const StyledErrorMessage = styled.div`
  padding: 4px 0;
  font-size: 12px;
  color: red;
  height: 20px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
`

export function ErrorMessageComponent (props: ErrorMessageProps) {
  const { errors, errorFor, form } = props
  // console.log('Error: ', errors, errorFor)
  return (
    <StyledErrorMessage>
      {errorFor
        ? (errors ?? form?.errors)?.[errorFor]?.message
        : (errors ?? form?.errors)?.message}
    </StyledErrorMessage>
  )
}

const ErrorMessage = React.memo(ErrorMessageComponent)

export { ErrorMessage }
export default ErrorMessage
