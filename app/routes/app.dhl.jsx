import React, { useState, useCallback } from "react";
import { Page, Button, ButtonGroup } from "@shopify/polaris";
import CancleWaybill from "./app.cancleWaybill";
import GenerateWaybill from "./app.generateWaybill";
import ProductDetails from "./app.ProductDetails";

export default function Dhl() {
    const [activeComponent, setActiveComponent] = useState("generate");
    const [isFirstButtonActive, setIsFirstButtonActive] = useState(true);

    const handleFirstButtonClick = useCallback(() => {
        if (isFirstButtonActive) return;
        setIsFirstButtonActive(true);
        setActiveComponent("generate");
    }, [isFirstButtonActive]);

    const handleSecondButtonClick = useCallback(() => {
        if (!isFirstButtonActive) return;
        setIsFirstButtonActive(false);
        setActiveComponent("cancel");
    }, [isFirstButtonActive]);

    const handleThirdButtonClick = useCallback(() => {
        setIsFirstButtonActive(false);
        setActiveComponent("product-details");
    }, []);

    return (
        <Page>
            <ButtonGroup variant="segmented">
                <Button pressed={isFirstButtonActive} onClick={handleFirstButtonClick}>
                    Generate Waybill
                </Button>
                <Button pressed={!isFirstButtonActive && activeComponent === "cancel"} onClick={handleSecondButtonClick}>
                    Cancel Waybill
                </Button>
                <Button pressed={activeComponent === "product-details"} onClick={handleThirdButtonClick}>
                    Product Details
                </Button>
            </ButtonGroup>

            {activeComponent === "generate" && <GenerateWaybill />}
            {activeComponent === "cancel" && <CancleWaybill />}
            {activeComponent === "product-details" && <ProductDetails />}
        </Page>
    );
}
