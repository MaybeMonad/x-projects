import React from 'react'
import styled from 'styled-components'
import clsx from 'clsx'

export interface LayoutProps {
  children:
    | ((props: any) => React.ReactElement | React.ReactElement[])
    | React.ReactElement
    | React.ReactElement[]
  className?: string
}

const StyledLayout = styled.div``

const Layout = (props: LayoutProps) => {
  const { children, className, ...rest } = props
  const resolvedChildren =
    typeof children === 'function'
      ? children(rest)
      : (children instanceof Array ? children : [children]).map(
          (child, index) => {
            return React.isValidElement(child)
              ? React.cloneElement(child, {
                  ...(child.props as any),
                  key: index.toString(),
                  ...rest
                })
              : child
          }
        )

  return (
    <StyledLayout className={clsx(className)}>{resolvedChildren}</StyledLayout>
  )
}

export { Layout }

export default Layout
