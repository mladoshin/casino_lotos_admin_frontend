import { Typography } from 'antd'
import { TextProps } from 'antd/es/typography/Text'
import React from 'react'

const {Text} = Typography
interface InlineTextProps extends TextProps {
}

function InlineText({children, style, ...props}: InlineTextProps) {
  return (
    <Text {...props} style={{ ...style, whiteSpace: "nowrap" }}>
        {children}
    </Text>
  )
}

export default InlineText