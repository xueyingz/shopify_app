import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Card, Layout, List, Page } from "@shopify/polaris";
import { authenticate } from "app/shopify.server";

const queryString = `#graphql
query inventoryItems {
  inventoryItems(first: 2) {
    edges {
      node {
        id
        tracked
        sku
      }
    }
  }
}`

export const loader: LoaderFunction = async ({ request }) => {
    const { admin } = await authenticate.admin(request)

    const response = await admin.graphql(queryString)

    const responseJson = await response.json()

    console.log('---responseJson', responseJson)
    return json({
        inventoryItems:responseJson
    })
}

export default function Inventory() {
    const data = useLoaderData<typeof loader>()
    console.log('---data', data)
    return (
        <div>
            <Page>
                <Layout>
                    <Layout.Section>
                        <Card>
                            <h1>Collections</h1>
                        </Card>
                    </Layout.Section>
                    <Layout.Section>
                        <Card>
                            {/* <List type="bullet" gap="loose">
                                {data.inventoryItems.map((edge: any) => {
                                    return (
                                        <List.Item key={edge.node.id}>
                                            {edge.node.title}
                                        </List.Item>
                                    )
                                })}
                            </List> */}
                        </Card>
                    </Layout.Section>
                </Layout>
            </Page>
        </div>
    )
}