import { json, LoaderFunction } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";
import { useActionData, useLoaderData, useSubmit } from "@remix-run/react";
import { Button, Card, Layout, List, Page, Form, TextField } from "@shopify/polaris";
import { authenticate } from "app/shopify.server";
import { useState } from "react";

export const action: ActionFunction = async ({ request }) => {
    const { admin } = await authenticate.admin(request)
    const formData = await request.formData()
    console.log('============', formData)
    const discountTitle = formData.get("discountTitle")
    // const discountTitle = "youtube-example-discount";
    const startsAt = "2024-11-01T00:00:00Z"
    const endsAt = "2024-12-30T00:00:00Z"
    const minimumRequirementSubtotal = 2;
    const discountAmount = 3;

    const response = await admin.graphql(`#graphql
    mutation discountAutomaticBasicCreate($automaticBasicDiscount: DiscountAutomaticBasicInput!) {
      discountAutomaticBasicCreate(automaticBasicDiscount: $automaticBasicDiscount) {
        automaticDiscountNode {
          id
          automaticDiscount {
            ... on DiscountAutomaticBasic {
              startsAt
              endsAt
              minimumRequirement {
                ... on DiscountMinimumSubtotal {
                  greaterThanOrEqualToSubtotal {
                    amount
                    currencyCode
                  }
                }
              }
              customerGets {
                value {
                  ... on DiscountAmount {
                    amount {
                      amount
                      currencyCode
                    }
                    appliesOnEachItem
                  }
                }
                items {
                  ... on AllDiscountItems {
                    allItems
                  }
                }
              }
            }
          }
        }
        userErrors {
          field
          code
          message
        }
      }
    }`,
        {
            variables: {
                "automaticBasicDiscount": {
                    "title": discountTitle,
                    startsAt,
                    endsAt,
                    "minimumRequirement": {
                        "subtotal": {
                            "greaterThanOrEqualToSubtotal": minimumRequirementSubtotal
                        }
                    },
                    "customerGets": {
                        "value": {
                            "discountAmount": {
                                "amount": discountAmount,
                                "appliesOnEachItem": false
                            }
                        },
                        "items": {
                            "all": true
                        }
                    }
                }
            },
        },)
    const responseJson = await response.json();
    return json({
        discount: responseJson.data
    })

}

export default function Discounts() {
    const [title, setTitle] = useState('')
    const submit = useSubmit()
    const data = useActionData()
    console.log('---data', data)

    const generateDiscount = async (e: any) => {
        console.log('-------------1')
        submit({discountTitle: title}, { replace: true, method: 'POST' })
    }

    return (
        <div>
            <Page>
                <Layout>
                    <Layout.Section>
                        <Card>
                            <h1>Discounts</h1>
                        </Card>
                    </Layout.Section>
                    <Layout.Section>
                        <Card>
                            <Form method='post' onSubmit={generateDiscount}>
                                <TextField id="discountTitle" label='Discount Title' name='discountTitle' autoComplete="off" value={title} onChange={(newVal) => setTitle(newVal)} />
                                <Button submit> create Discount</Button>
                            </Form>
                        </Card>
                    </Layout.Section>
                </Layout>
            </Page>
        </div>
    )
}