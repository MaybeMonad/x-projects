import { useState } from 'react'
import clsx from 'clsx'
import styled from 'styled-components'

export interface WrapperProps {
  className?: string
  children?: React.ReactText | React.ReactElement | React.ReactElement[]
  message?: {
    type: 'fail' | 'success' | string
    msg: string
  }
}

const StyledWrapper = styled.div`
  position: relative;

  .message {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    overflow: hidden;
    border-radius: 6px;
    padding: 8px 12px;
    font-weight: 500;
    height: 36px;
    font-size: 12px;
    position: absolute;
    bottom: -48px;
    left: 0;

    &.fail {
      background-color: #fee2e2;
      color: #f87171;
    }

    &.success {
      background-color: #d1fae5;
      color: #10b981;
    }
  }
`

export function Wrapper (props: WrapperProps) {
  const {
    className,
    message = {
      type: '',
      msg: ''
    },
    children
  } = props

  return (
    <StyledWrapper className={className}>
      {children}
      <div
        className={clsx('message', {
          [message.type]: message.msg
        })}
      >
        {message.msg}
      </div>
    </StyledWrapper>
  )
}

export default Wrapper
