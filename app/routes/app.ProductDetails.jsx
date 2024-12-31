import React, { useState, useCallback, useEffect } from "react";
import { Page, Card, DataTable, Banner, Text, Button, Modal, BlockStack, InlineStack, ButtonGroup } from "@shopify/polaris";

export default function ProductDetails() {
    const [products, setProducts] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [jwtToken, setJwtToken] = useState('');
    const [activeProduct, setActiveProduct] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    const clientID = '5jRX1SsJtBujJ2YozVldsGJYd0WgmEQG';
    const clientSecret = 'comCncWQyG5sYERR';

    const generateJwtToken = async () => {
        try {
            const res = await fetch('https://apigateway-sandbox.bluedart.com/in/transportation/token/v1/login', {
                method: 'GET',
                headers: {
                    'accept': 'application/json',
                    'ClientID': clientID,
                    'clientSecret': clientSecret,
                }
            });

            const data = await res.json();
            if (data && data.JWTToken) {
                setJwtToken(data.JWTToken);
                return data.JWTToken;
            } else {
                console.error('Failed to generate JWT token:', data);
            }
        } catch (error) {
            console.error('Error generating JWT token:', error);
        }
        return null;
    };

    const fetchProducts = useCallback(async () => {
        let token = await generateJwtToken();
        if (!token) return;

        const res = await fetch('https://apigateway-sandbox.bluedart.com/in/transportation/allproduct/v1/GetAllProductsAndSubProducts', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'JWTToken': token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                profile: {
                    Api_type: 'S',
                    LicenceKey: "kh7mnhqkmgegoksipxr0urmqesesseup",
                    LoginID: "GG940111",
                }
            })
        });

        const data = await res.json();
        console.log(data);

        if (data.GetAllProductsAndSubProductsResult && !data.GetAllProductsAndSubProductsResult.IsError) {
            const productList = data.GetAllProductsAndSubProductsResult.ProductList;
            setProducts(productList);
            setErrorMessage('');
        } else {
            setErrorMessage('No products found or error fetching data.');
        }
    }, [generateJwtToken]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleRefresh = () => {
        fetchProducts();
    };

    const handleRowClick = (product) => {
        setActiveProduct(product);
        setModalOpen(true);
    };

    const handleModalClose = () => {
        setModalOpen(false);
        setActiveProduct(null);
    };

    const productTable = products.length > 0 ? (
        <DataTable
            columnContentTypes={[
                'text',
                'text',
            ]}
            headings={['Product Name', 'Sub-Products']}
            rows={products.map(product => [
                <Button onClick={() => handleRowClick(product)}>{product.ProductName}</Button>,
                product.SubProducts.length > 5 ? `${product.SubProducts.slice(0, 5).join(', ')}...` : product.SubProducts.join(', ')
            ])}
        />
    ) : null;

    return (
        <Page>
            <Card sectioned>
                <BlockStack gap="200">
                    <Text variant="headingXl" as="h4">Product Details</Text>
                    {errorMessage && (
                        <Banner status="critical">
                            <p>{errorMessage}</p>
                        </Banner>
                    )}
                    {productTable}
                    {activeProduct && (
                        <Modal
                            open={modalOpen}
                            onClose={handleModalClose}
                            title={activeProduct.ProductName}
                            primaryAction={{
                                content: 'Close',
                                onAction: handleModalClose,
                            }}
                        >
                            <Modal.Section>
                                <Text variant="bodyMd" as="p">
                                    Sub-Products: {activeProduct.SubProducts.join(', ')}
                                </Text>
                            </Modal.Section>
                        </Modal>
                    )}
                    <InlineStack align="end">
                        <ButtonGroup>
                            <Button onClick={handleRefresh}>Refresh</Button>
                        </ButtonGroup>
                    </InlineStack>
                </BlockStack>
            </Card>
        </Page>
    );
}
