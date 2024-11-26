import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Card, Layout, List, Page } from "@shopify/polaris";
import { authenticate, apiVersion } from "app/shopify.server";

const queryString = `#graphql
query {
    collections(first:10) {
    edges {
        node {
        id
        title
        handle
        }
    }
}
}`


export const loader: LoaderFunction = async ({ request }) => {
    const { session, admin } = await authenticate.admin(request)
    const { shop, accessToken } = session;

    const response = await admin.graphql(queryString)
    const responseJson = await response.json()


    return json({
        collections: responseJson.data.collections.edges
    })
}

export default function Collections() {
    const data = useLoaderData<typeof loader>()
    console.log('data', data)
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
                            <List type="bullet" gap="loose">
                                {data.collections.map((edge: any) => {
                                    return (
                                        <List.Item key={edge.node.id}>
                                            {edge.node.title}
                                        </List.Item>
                                    )
                                })}
                            </List>
                        </Card>
                    </Layout.Section>
                </Layout>
            </Page>
        </div>
    )
}