import React, { useState, useEffect } from 'react';
import { Page, Button, Spinner, Text, Card, BlockStack } from '@shopify/polaris';
import { pdf } from '@react-pdf/renderer';
import { generateBarcodeBase64 } from './util/barcodeUtils';
import MyDocument from './MyDocument';
import saveAs from 'file-saver';

// Helper function to generate a random alphanumeric string
const generateRandomString = (length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
    }
    return result;
};

export default function GenerateWaybill({ order, onClose }) {
    const [response, setResponse] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [jwtToken, setJwtToken] = useState('');
    const clientID = '5jRX1SsJtBujJ2YozVldsGJYd0WgmEQG';
    const clientSecret = 'comCncWQyG5sYERR';

    useEffect(() => {
        const fetchToken = async () => {
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
                } else {
                    console.error('Failed to generate JWT token:', data);
                }
            } catch (error) {
                console.error('Error generating JWT token:', error);
            }
        };

        fetchToken();
    }, []);

    const fetchWaybill = async () => {
        if (!jwtToken) {
            return;
        }

        if (!order) {
            setErrorMessage('Order data is not available.');
            return;
        }

        const itemDetails = order.line_items.map((item, index) => ({
            HSCode: "",
            IGSTAmount: 0,
            IGSTRate: 0,
            Instruction: "",
            InvoiceDate: `/Date(${new Date(order.created_at).getTime()})/`,
            InvoiceNumber: order.order_number.toString(),
            ItemID: index.toString(),
            ItemName: item.name || "N/A",
            ItemValue: parseFloat(item.price),
            Itemquantity: item.quantity,
            PlaceofSupply: order.billing_address.city || order.billing_address.city,
            ProductDesc1: item.title,
            ProductDesc2: item.variant_title,
            ReturnReason: "",
            SGSTAmount: 0,
            SKUNumber: item.sku || "",
            SellerGSTNNumber: "",
            SellerName: "",
            TaxableAmount: parseFloat(item.price),
            TotalValue: parseFloat(item.price) * item.quantity,
            CGSTAmount: 0,
            cessAmount: "0.0",
            countryOfOrigin: "IN",
            docType: "INV",
            subSupplyType: 1,
            supplyType: "0"
        }));

        const internationalItemDetails = order.line_items.map((item, index) => ({
            "CGSTAmount": 0.0,
            // "CommodityCode": "FOODSTUFF",
            "Discount": 0.0,
            "HSCode": item.hs_code || "95059090",
            "IGSTAmount": 0.0,
            "IGSTRate": 0.0,
            "Instruction": "",
            "InvoiceDate": `/Date(${new Date(order.created_at).getTime()})/`,
            "InvoiceNumber": order.order_number.toString(),
            "IsMEISS": "0",
            "ItemID": (index + 1).toString(),
            "ItemName": item.name || "N/A",
            "ItemValue": parseFloat(item.price_set.presentment_money.amount),
            "Itemquantity": item.quantity,
            "LicenseNumber": "",
            "ManufactureCountryCode": "IN",
            "ManufactureCountryName": "India",
            "PerUnitRate": parseFloat(item.price_set.presentment_money.amount),
            "PieceID": "23451",
            "PieceIGSTPercentage": 0.0,
            "PlaceofSupply": "",
            "ProductDesc1": item.title || "Others",
            "ProductDesc2": "",
            "ReturnReason": "",
            "SGSTAmount": 0.0,
            "SKUNumber": item.sku || "NA",
            "SellerGSTNNumber": "",
            "SellerName": "",
            "TaxableAmount": parseFloat(item.price_set.presentment_money.amount) * item.quantity,
            "TotalValue": parseFloat(item.price_set.presentment_money.amount) * item.quantity,
            "Unit": "PCS",
            "Weight": item.grams / 1000,
            "cessAmount": "0.0",
            "countryOfOrigin": "IN"
        }));

        const DomesticData = {
            "Request": {
                "Consignee": {
                    "ConsigneeAddress1": order.shipping_address.address1 || "N/A",
                    "ConsigneeAddress2": order.shipping_address.address2 || "N/A",
                    "ConsigneeAddress3": order.shipping_address.city || "N/A",
                    "ConsigneeAttention": `${order.shipping_address.first_name} ${order.shipping_address.last_name}` || "N/A",
                    "ConsigneeEmailID": order.customer.email || "N/A",
                    "ConsigneeMobile": order.shipping_address.phone || "+919999999999",
                    "ConsigneeName": `${order.shipping_address.first_name} ${order.shipping_address.last_name}` || "N/A",
                    "ConsigneePincode": order.shipping_address.zip || "N/A",
                },
                "Returnadds": {
                    "ManifestNumber": "",
                    "ReturnAddress1": order.shipping_address.address1 || "",
                    "ReturnAddress2": order.shipping_address.address2 || "",
                    "ReturnAddress3": order.shipping_address.city || "",
                    "ReturnAddressinfo": "",
                    "ReturnContact": order.customer.phone || "",
                    "ReturnEmailID": order.customer.email || "",
                    "ReturnMobile": order.customer.phone || "",
                    "ReturnPincode": order.shipping_address.zip || "",
                    "ReturnTelephone": ""
                },
                "Services": {
                    "AWBNo": "",
                    "ActualWeight": "0.50",
                    // "CollectableAmount": parseFloat(order.current_subtotal_price_set.presentment_money.amount),
                    "Commodity": {
                        "CommodityDetail1": "5011100014",
                        "CommodityDetail2": "5011100014",
                        "CommodityDetail3": "5011100014"
                    },
                    "CreditReferenceNo": generateRandomString(10),
                    "CreditReferenceNo2": "",
                    "CreditReferenceNo3": "",
                    "CurrencyCode": order.current_total_price_set.presentment_money.currency_code,
                    "DeclaredValue": parseFloat(order.current_total_price_set.presentment_money.amount),
                    "DeliveryTimeSlot": "",
                    "Dimensions": [
                        {
                            "Breadth": 10,
                            "Count": 1,
                            "Height": 10,
                            "Length": 10
                        }
                    ],
                    "FavouringName": "",
                    "ForwardAWBNo": "",
                    "ForwardLogisticCompName": "",
                    "InsurancePaidBy": "",
                    "InvoiceNo": order.order_number.toString(),
                    "IsChequeDD": "",
                    "IsDedicatedDeliveryNetwork": false,
                    "IsForcePickup": false,
                    "IsPartialPickup": false,
                    "IsReversePickup": false,
                    "ItemCount": order.line_items.length,
                    "OTPBasedDelivery": "0",
                    "OTPCode": "",
                    "Officecutofftime": "",
                    "PDFOutputNotRequired": true,
                    "ParcelShopCode": "",
                    "PayableAt": "",
                    "PickupDate": `/Date(${new Date(order.created_at).getTime()})/`,
                    "PickupMode": "",
                    "PickupTime": "0800",
                    "PickupType": "",
                    "PieceCount": 1,
                    "PreferredPickupTimeSlot": "",
                    "ProductCode": "D",
                    "ProductFeature": "",
                    "ProductType": 2,
                    "RegisterPickup": true,
                    "SpecialInstruction": "",
                    "SubProductCode": "",
                    "TotalCashPaytoCustomer": 0,
                    "itemdtl": itemDetails,
                    "noOfDCGiven": 0
                },
                "Shipper": {
                    "CustomerAddress1": "Chhabra Niwas,NICC, Block B",
                    "CustomerAddress2": "Meera Nagar Near Botanical Cafe",
                    "CustomerAddress3": "Udaipur,Rajasthan",
                    "CustomerAddressinfo": "",
                    "CustomerCode": "940111",
                    "CustomerEmailID": "",
                    "CustomerGSTNumber": "08APIPC2158J1ZW",
                    "CustomerLatitude": "",
                    "CustomerLongitude": "",
                    "CustomerMaskedContactNumber": "",
                    "CustomerMobile": "9785367777",
                    "CustomerName": "Pooja Chhabra",
                    "CustomerPincode": "122002",
                    "CustomerTelephone": "9785367777",
                    "IsToPayCustomer": false,
                    "OriginArea": "GGN",
                    "Sender": "Pooja Chhabra",
                    "VendorCode": "125465"
                }
            },
            "Profile": {
                "LoginID": "GG940111",
                "LicenceKey": "kh7mnhqkmgegoksipxr0urmqesesseup",
                "Api_type": "S"
            }
        };

        const InternationalData = {
            "Request": {
                "Consignee": {
                    "AvailableDays": "",  // Add default value if known
                    "AvailableTiming": "",  // Add default value if known
                    "ConsigneeAddress1": order.billing_address.address1 || order.shipping_address.address1 || "17667 VINTAGE OAK DR",
                    "ConsigneeAddress2": order.billing_address.address2 || order.shipping_address.address2 || "WILD WOOD",
                    "ConsigneeAddress3": order.billing_address.city || order.shipping_address.city || "ST LOUIS,MO (MISSOURI)",
                    "ConsigneeAddressType": "",  // Add default value if known
                    "ConsigneeAddressinfo": "",  // Add default value if known
                    "ConsigneeAttention": `${order.shipping_address.first_name} ${order.shipping_address.last_name}` || "NA",
                    "ConsigneeBusinessPartyTypeCode": "",  // Add default value if known
                    "ConsigneeCityName": order.billing_address.city || order.shipping_address.city || "Dubai",
                    "ConsigneeCountryCode": order.shipping_address.country_code || order.billing_address.country_code || "AE",
                    "ConsigneeEmailID": order.customer.email || "test@gmail.com",
                    "ConsigneeFiscalID": "",  // Add default value if known
                    "ConsigneeFiscalIDType": "",  // Add default value if known
                    "ConsigneeFullAddress": "",  // Add default value if known
                    "ConsigneeGSTNumber": "",  // Add default value if known
                    "ConsigneeID": order.customer.id || "",  // Ensure ID is provided or set default
                    "ConsigneeIDType": "",  // Add default value if known
                    "ConsigneeLatitude": "",  // Add default value if known
                    "ConsigneeLongitude": "",  // Add default value if known
                    "ConsigneeMaskedContactNumber": "",  // Add default value if known
                    "ConsigneeMobile": order.shipping_address.phone || "9999999441",
                    "ConsigneeName": `${order.shipping_address.first_name} ${order.shipping_address.last_name}` || "RAJNISH VERMA",
                    "ConsigneePincode": order.shipping_address.zip || "",
                    "ConsigneeStateCode": order.shipping_address.province_code || "",
                    "ConsigneeTelephone": order.shipping_address.phone || "13142014355",
                    "ConsingeeFederalTaxId": "",  // Add default value if known
                    "ConsingeeRegistrationNumber": "",  // Add default value if known
                    "ConsingeeRegistrationNumberIssuerCountryCode": "",  // Add default value if known
                    "ConsingeeRegistrationNumberTypeCode": "",  // Add default value if known
                    "ConsingeeStateTaxId": ""  // Add default value if known
                },
                "Services": {
                    "AWBNo": "",  // Add default value if known
                    "ActualWeight": "0.50",
                    "AdditionalDeclaration": "",  // Add default value if known
                    "AuthorizedDealerCode": "6390948XXXXXXX",
                    "BankAccountNumber": "",  // Add default value if known
                    "BillToAddressLine1": "",  // Add default value if known
                    "BillToCity": "",  // Add default value if known
                    "BillToCompanyName": "",  // Add default value if known
                    "BillToContactName": "",  // Add default value if known
                    "BillToCountryCode": "",  // Add default value if known
                    "BillToCountryName": "",  // Add default value if known
                    "BillToFederalTaxID": "",  // Add default value if known
                    "BillToPhoneNumber": "",  // Add default value if known
                    "BillToPostcode": "",  // Add default value if known
                    "BillToState": "",  // Add default value if known
                    "BillToSuburb": "",  // Add default value if known
                    "BillingReference1": "",  // Add default value if known
                    "BillingReference2": "",  // Add default value if known
                    "CessCharge": 0.0,
                    // "CollectableAmount": parseFloat(order.current_total_price),
                    "Commodity": {
                        "CommodityDetail1": "Rakhi Wrist Band",
                        "CommodityDetail2": "",  // Add default value if known
                        "CommodityDetail3": ""  // Add default value if known
                    },
                    "CreditReferenceNo": generateRandomString(10),
                    "CreditReferenceNo2": "",  // Add default value if known
                    "CreditReferenceNo3": "",  // Add default value if known
                    "CurrencyCode": order.current_total_price_set.presentment_money.currency_code,
                    "DeclaredValue": parseFloat(order.current_total_price_set.presentment_money.amount),
                    "Dimensions": [
                        {
                            "Breadth": 10,
                            "Count": 1,
                            "Height": 10,
                            "Length": 10
                        }
                    ],
                    "ECCN": "",  // Add default value if known
                    "EsellerPlatformName": "",  // Add default value if known
                    "ExchangeWaybillNo": "",  // Add default value if known
                    "ExportImportCode": "1234567894",
                    "ExportReason": "",  // Add default value if known
                    "ExporterAddressLine1": "",  // Add default value if known
                    "ExporterAddressLine2": "",  // Add default value if known
                    "ExporterAddressLine3": "",  // Add default value if known
                    "ExporterBusinessPartyTypeCode": "",  // Add default value if known
                    "ExporterCity": "",  // Add default value if known
                    "ExporterCompanyName": "",  // Add default value if known
                    "ExporterCountryCode": "",  // Add default value if known
                    "ExporterCountryName": "",  // Add default value if known
                    "ExporterDivision": "",  // Add default value if known
                    "ExporterDivisionCode": "",  // Add default value if known
                    "ExporterEmail": "",  // Add default value if known
                    "ExporterFaxNumber": "",  // Add default value if known
                    "ExporterMobilePhoneNumber": "",  // Add default value if known
                    "ExporterPersonName": "",  // Add default value if known
                    "ExporterPhoneNumber": "",  // Add default value if known
                    "ExporterPostalCode": "",  // Add default value if known
                    "ExporterRegistrationNumber": "",  // Add default value if known
                    "ExporterRegistrationNumberIssuerCountryCode": "",  // Add default value if known
                    "ExporterRegistrationNumberTypeCode": "",  // Add default value if known
                    "ExporterSuiteDepartmentName": "",  // Add default value if known
                    "FavouringName": "",  // Add default value if known
                    "ForwardAWBNo": "",  // Add default value if known
                    "ForwardLogisticCompName": "",  // Add default value if known
                    "FreightCharge": 0.0,
                    "GovNongovType": "",  // Add default value if known
                    "IncotermCode": "DAP",
                    "InsuranceAmount": 0.0,
                    "InsurancePaidBy": "",  // Add default value if known
                    "InsurenceCharge": 0.0,
                    "InvoiceNo": order.order_number.toString() || "",  // Ensure InvoiceNo is provided or set default
                    "IsCargoShipment": false,
                    "IsChequeDD": "",  // Add default value if known
                    "IsCommercialShipment": false,
                    "IsDedicatedDeliveryNetwork": false,
                    "IsDutyTaxPaidByShipper": false,
                    "IsEcomUser": 1,
                    "IsForcePickup": false,
                    "IsIntlEcomCSBUser": 0,
                    "IsInvoiceRequired": true,
                    "IsPartialPickup": false,
                    "IsReversePickup": false,
                    "ItemCount": order.line_items.length || 1,
                    "NFEIFlag": false,
                    "PDFOutputNotRequired": false,
                    "PackType": "1",
                    "PayerGSTVAT": 0.0,
                    "PickupDate": `/Date(${new Date(order.created_at).getTime()})/`,
                    "PickupTime": "1400",
                    // "PieceCount": internationalItemDetails.length.toString() || "0",
                    "PieceCount": 1,
                    "PrinterLableSize": "4",
                    "ProductCode": "I",
                    "ProductType": 2,
                    "RegisterPickup": false,
                    "ReverseCharge": 0.0,
                    "SubProductCode": "",  // Add default value if known
                    "SupplyOfIGST": "No",
                    "SupplyOfwoIGST": "Yes",
                    "TermsOfTrade": "DAP",
                    "TotalCashPaytoCustomer": 0.0,
                    "Total_IGST_Paid": 0.0,
                    "itemdtl": internationalItemDetails,
                    "noOfDCGiven": 0
                },
                "Shipper": {
                    "CustomerAddress1": "Chhabra Niwas,NICC, Block B",
                    "CustomerAddress2": "Meera Nagar Near Botanical Cafe",
                    "CustomerAddress3": "Udaipur,Rajasthan",
                    "CustomerCode": "940111",
                    "CustomerEmailID": "chhabrapooja14@gmail.com",
                    "CustomerGSTNumber": "08APIPC2158J1ZW",
                    "CustomerMobile": "9785367777",
                    "CustomerName": "Pooja Chhabra",
                    "CustomerPincode": "122002",
                    "CustomerTelephone": "9785367777",
                    "IsToPayCustomer": false,
                    "OriginArea": "GGN",
                    "Sender": "Pooja Chhabra",
                    "VendorCode": "231335"
                }
            },
            "Profile": {
                "LoginID": "GG940111",
                "LicenceKey": "kh7mnhqkmgegoksipxr0urmqesesseup",
                "Api_type": "S"
            }
        };
        console.log(InternationalData);

        let RequestData = "";
        if (order.shipping_address.country_code !== 'IN') {
            RequestData = InternationalData;
        } else {
            RequestData = DomesticData;
        }
        console.log(RequestData);
        try {
            setLoading(true);
            const res = await fetch('https://apigateway-sandbox.bluedart.com/in/transportation/waybill/v1/GenerateWayBill', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'JWTToken': jwtToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(RequestData)
            });

            const data = await res.json();
            console.log(data);

            if (data["error-response"] && data["error-response"].length > 0) {
                const errorResponse = data["error-response"][0];
                if (errorResponse.IsError) {
                    const errorMessage = errorResponse.Status.map(status => status.StatusInformation).join(', ');
                    setErrorMessage(errorMessage);
                }
            } else {
                setErrorMessage('');
                if (data.GenerateWayBillResult.AWBPrintContent) {
                    // Generate PDF from AWBPrintContent
                    const byteArray = new Uint8Array(data.GenerateWayBillResult.AWBPrintContent);
                    const blob = new Blob([byteArray], { type: 'application/pdf' });
                    saveAs(blob, `${data.GenerateWayBillResult.AWBNo}.pdf`);
                } else {
                    // Generate barcode as base64 string
                    const AwbNo = data.GenerateWayBillResult.AWBNo;
                    const DestinationLocation = data.GenerateWayBillResult.DestinationLocation;
                    const barcodeBase64 = await generateBarcodeBase64(AwbNo);
                    const DestinationArea = data.GenerateWayBillResult.DestinationArea;
                    // Generate PDF using the barcode
                    const blob = await pdf(
                        <MyDocument
                            barcodeBase64={barcodeBase64}
                            domesticData={DomesticData}
                            AWBNo={AwbNo}
                            destinationLocation={DestinationLocation}
                            destinationArea={DestinationArea}
                        />
                    ).toBlob();

                    // Automatically download the generated PDF
                    saveAs(blob, `${AwbNo}.pdf`);
                }

                setResponse(data);
            }
        } catch (error) {
            console.error('Error fetching waybill:', error);
            setErrorMessage('Failed to generate waybill.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (order) {
            fetchWaybill();
        }
    }, [order]);

    return (
            <Page>
                {errorMessage && <Text color="red">{errorMessage}</Text>}
                <BlockStack gap={400}>
                    <Text color="warning" variant="headingMd" as="h2">Are you sure you want to generate a waybill for the following customer?</Text>
                    {loading && <Spinner size='small'/>}
                    {!loading && !errorMessage && (
                        <Card sectioned>
                            <Text><strong>Order Number:</strong> {order.order_number}</Text>
                            <Text><strong>Customer:</strong> {`${order.customer.first_name} ${order.customer.last_name}`}</Text>
                            <Text><strong>Date:</strong> {new Date(order.created_at).toLocaleString()}</Text>
                            <Text><strong>Total Price:</strong> {`${order.currency} ${order.current_total_price}`}</Text>
                            <Text><strong>Items:</strong></Text>
                            <ul>
                                {order.line_items.map(item => (
                                    <li key={item.id}>
                                        {item.quantity} x {item.title}
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    )}
                    {pdfUrl && (
                        <iframe
                            src={pdfUrl}
                            style={{ width: '100%', height: '600px' }}
                            title="PDF Preview"
                        />
                    )}

                    <Button onClick={fetchWaybill} variant="primary">Download PDF</Button>
                </BlockStack>
            </Page>
    );
}
