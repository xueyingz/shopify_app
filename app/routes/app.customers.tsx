import type { ActionFunction } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useActionData, useSubmit } from "@remix-run/react"
import { Button, Card, Form, Page, TextField } from "@shopify/polaris"
import { createCustomer } from "app/api/prisma.server"
import { authenticate } from "app/shopify.server"
import { useState } from "react"

export const action: ActionFunction = async ({ request }) => {
    const { admin } = await authenticate.admin(request)
    const formData = await request.formData()
    const email = formData.get('email')
    const name = formData.get('name')
    const response = await admin.graphql(`#graphql
    mutation customerCreate($input: CustomerInput!) {
      customerCreate(input: $input) {
        userErrors {
          field
          message
        }
        customer {
          id
          email
          phone
          taxExempt
          firstName
          lastName
          amountSpent {
            amount
            currencyCode
          }
          smsMarketingConsent {
            marketingState
            marketingOptInLevel
            consentUpdatedAt
          }
        }
      }
    }`,
        {
            variables: {
                "input": {
                    "email": email,
                    "phone": "+18880887799",
                    "firstName": name,
                    "smsMarketingConsent": {
                        "marketingState": "SUBSCRIBED",
                        "marketingOptInLevel": "SINGLE_OPT_IN"
                    }
                }
            },
        },)
    const responseDara = await response.json()
    await createCustomer({
        email,
        name,
    })
    return json({
        data: responseDara
    })
}

export default function Customers() {
    const submit = useSubmit()
    const actionData = useActionData()
    console.log(actionData)

    const [name, setName] = useState<string>()
    const [email, setEmail] = useState<string>()

    const generateCustomer = () => {
        submit({name, email}, { method: 'post', replace: true })
    }
    return (
        <Page>
            <Card>
                <Form method="post" onSubmit={generateCustomer}>

                    <TextField name="name" label='name' autoComplete="off" value={name} onChange={(val) => setName(val)} ></TextField>
                    <TextField name="email" label='email' autoComplete="off" value={email} onChange={(val) => setEmail(val)} ></TextField>
                    <Button submit>Create Customer</Button>
                </Form>
            </Card>
        </Page>
    )
}