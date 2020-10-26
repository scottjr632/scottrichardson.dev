/* eslint react/prop-types: 0 */
import React from "react"
import { preToCodeBlock } from "mdx-utils"
import { Text, Input, Field, Flex, Textarea, Button } from "@theme-ui/components"
import Code from "@lekoarts/gatsby-theme-minimal-blog/src/components/code"
import Title from "@lekoarts/gatsby-theme-minimal-blog/src/components/title"

const components = {
  Text: ({ children, ...props }) => <Text {...props}>{children}</Text>,
  Title: ({ children, text, ...props }) => (
    <Title text={text} {...props}>
      {children}
    </Title>
  ),
  Input: ({ ...props }) => <Input {...props} />,
  Field: ({ ...props }) => <Field {...props} />,
  Flex: ({ children, ...props }) => <Flex {...props}>{children}</Flex>,
  TextArea: ({ ...props }) => <Textarea {...props} />,
  Button: ({ children, ...props }) => (
    <Button
      {...props}
      sx={{
        cursor: 'pointer',
        margin: '0.459rem auto',
        width: '100%',
        ...props.sx,
      }}
    >
      {children}
    </Button>
  ),
  pre: (preProps) => {
    const props = preToCodeBlock(preProps)
    // if there's a codeString and some props, we passed the test
    if (props) {
      return <Code {...props} />
    }
    // it's possible to have a pre without a code in it
    return <pre {...preProps} />
  },
  wrapper: ({ children }) => <>{children}</>,
}

export default components
