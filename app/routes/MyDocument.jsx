import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { Font } from '@react-pdf/renderer';
import NotoSans from "./fonts/NotoSans-Italic-VariableFont_wdth,wght.ttf";
import logoImg from '../images/logo.png';

// Register Font
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf',
      fontWeight: 500,
    },
  ],
});

const MyDocument = ({ barcodeBase64, domesticData, AWBNo, destinationArea, destinationLocation }) => {
  const Consignee = domesticData.Request.Consignee;
  const Services = domesticData.Request.Services;
  const Shipper = domesticData.Request.Shipper;

  const { itemdtl = [] } = Services;

  // Calculate height based on item count
  const itemCount = itemdtl.length;
  let contentHeight = '55%';

  if (itemCount > 2) {
    contentHeight = `${Math.min(45 + (itemCount - 2) * 5, 85)}%`;
  }


  const formatDate = (timestamp) => {
    const date = new Date(parseInt(timestamp.match(/\d+/)[0]));
    return date.toISOString().split('T')[0];
  };

  return (
    <Document>
      <Page style={styles.body}>
        <View style={{ ...styles.contentWrapper, height: contentHeight }}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image src={logoImg} style={styles.logo} />
            </View>
            <View style={styles.contentContainer}>
              <Text style={styles.orderInfo}>Order No. #{Services.InvoiceNo || 'N/A'}</Text>
              <Text style={styles.orderInfo}>Order Date - {Services.PickupDate ? formatDate(Services.PickupDate) : 'N/A'}</Text>
              <Text style={styles.orderInfo}>Address - {Shipper.CustomerAddress3 || 'N/A'} - {Shipper.CustomerPincode || 'N/A'}</Text>
              <Text style={styles.orderInfo}>Shipped By - {Shipper.Sender || 'N/A'}</Text>
              <Text style={styles.orderInfo}>GSTIN - {Shipper.CustomerGSTNumber || 'N/A'}</Text>
              <Text style={styles.prepaidRight}>Prepaid</Text>
            </View>
          </View>

          <View style={styles.barcodeContainer}>
            <Text style={styles.barcodeText}>{Shipper.OriginArea} / {destinationArea} / {destinationLocation}</Text>
            <View style={styles.barcodeImage}>
              <Image src={barcodeBase64} style={styles.barcodeImage} />
              <Text style={[styles.barcodeText, { color: 'red' }]}>*{AWBNo}*</Text>
            </View>
          </View>

          <View style={styles.addressContainer}>
            <View style={styles.address}>
              <Text style={styles.delivery}>Delivery Address</Text>
              <Text style={styles.deliveryContent}>{Consignee.ConsigneeAttention || 'N/A'}</Text>
              <Text style={styles.deliveryContent}>{Consignee.ConsigneeAddress2 || 'N/A'} , {Consignee.ConsigneeAddress1 || 'N/A'}</Text>
              <Text style={styles.deliveryContent}>{Consignee.ConsigneeAddress3 || 'N/A'} - {Consignee.ConsigneePincode}</Text>
            </View>
            <View style={styles.prepaidContainer}>
              <Text style={styles.prepaidRight}>Prepaid</Text>
              <Text style={styles.declareValue}>Rs.{Services.DeclaredValue}</Text>
            </View>
          </View>

          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.noborder, styles.tableHeaderTextSerial]}>S.no</Text>
              <Text style={[styles.tableHeaderText, styles.tableHeaderTextDescription]}>Item Description</Text>
              <Text style={[styles.tableHeaderText, styles.tableHeaderTextSku]}>SKU</Text>
              <Text style={[styles.tableHeaderText, styles.tableHeaderTextQty]}>Qty</Text>
            </View>
            {itemdtl.map((item, index) => (
              <View style={styles.tableRow} key={item.ItemID || index}>
                <Text style={[styles.tableCell, styles.noborder, styles.tableCellSerial]}>{index + 1}</Text>
                <Text style={[styles.tableCell, styles.tableCellDescription]}>{item.ItemName || 'N/A'}</Text>
                <Text style={[styles.tableCell, styles.tableCellSku]}>{item.SKUNumber || 'N/A'}</Text>
                <Text style={[styles.tableCell, styles.tableCellQty]}>{item.Itemquantity || 'N/A'}</Text>
              </View>
            ))}
            <Text style={styles.dimensions}>
              Dimensions: {Services.Dimensions?.[0]?.Length || 'N/A'} x {Services.Dimensions?.[0]?.Breadth || 'N/A'} x {Services.Dimensions?.[0]?.Height || 'N/A'}, Total Weight: {Services.ActualWeight || 'N/A'} KG
            </Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.fo_text}>If undelivered, please return to:</Text>
            <Text style={styles.fo_text}>{Shipper.CustomerAddress1 || 'N/A'},{Shipper.CustomerAddress2 || 'N/A'} , {Shipper.CustomerAddress3 || 'N/A'} - {Shipper.CustomerPincode || 'N/A'}</Text>
            <Text style={styles.fo_text}>Phone - {Shipper.CustomerMobile || 'N/A'}</Text>
            <Text style={styles.disclaimer}>
              Disclaimer: Blue Dart is not responsible for any kind of cost difference or poor quality.
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

// Define styles for the PDF content
const styles = StyleSheet.create({
  page: {
    family: 'Roboto',
  },
  body: {
    padding: 30,
    margin: 0,
    position: 'relative',
  },
  contentWrapper: {
    margin: 10,
    width: '70%',
    border: '2px solid black',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: 'black',
    height: '26%',
    paddingBottom: 10,
    marginBottom: 10,
  },
  logoContainer: {
    width: '50%',
    paddingLeft: 10,
    paddingVertical: 5,
    paddingTop: 12,
  },
  logo: {
    width: 100,
    height: 50,
    objectFit: 'fill',
  },
  contentContainer: {
    width: '60%',
    padding: 10,
    paddingVertical: 10,
    textAlign: 'right',
  },
  prepaidContainer: {
    flexDirection: 'column', // Stack elements vertically
    alignItems: 'flex-end',  // Align text to the right
    marginRight: 10,
  },
  prepaidRight: {
    fontSize: 18, // Bigger font for Prepaid
    fontWeight: 'bold',
  },
  declareValue: {
    fontSize: 14, // Smaller font for DeclaredValue
    fontWeight: 'bold',
    marginBottom: 20,
  },
  orderInfo: {
    fontSize: 7,
    marginBottom: 3,
    textAlign: 'right',
  },
  barcodeContainer: {
    borderBottomWidth: 1,
    borderBottomColor: 'black',
    paddingHorizontal: 10,
    paddingVertical: 15,
    alignItems: 'center',
    textAlign: 'center',
  },
  barcodeText: {
    fontWeight: 900,
    marginBottom: 5,
    fontSize: 10,
    textAlign: 'center',
  },
  barcodeImage: {
    width: 200,
    height: 100,
    objectFit: 'fill',
    alignSelf: 'center',
  },
  addressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottom: '1px solid black',
    padding: 5,
    paddingBottom: 10,
  },
  address: {
    width: '70%',
  },
  delivery: {
    fontSize: 12,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  deliveryContent: {
    fontSize: 8,
    marginBottom: 8,
  },
  tableContainer: {
    borderBottom: '1px solid black',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
  },
  tableHeaderText: {
    flex: 1,
    fontSize: 8,
    textAlign: 'center',
    padding: 5,
    paddingBottom: 10,
    borderLeftWidth: 1,
    borderLeftColor: '#000',
    borderLeftStyle: 'solid',
  },
  noborder: {
    borderLeftWidth: 0,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
  },
  tableCell: {
    flex: 1,
    fontSize: 6,
    textAlign: 'center',
    padding: 5,
    paddingBottom: 14,
    borderLeftWidth: 1,
    borderLeftColor: '#000',
    borderLeftStyle: 'solid',
    minHeight: 10,
  },
  dimensions: {
    fontSize: 6,
    marginTop: 0,
    textAlign: 'center',
    paddingTop: 4,
    paddingBottom: 10,
  },
  footer: {
    fontSize: 10,
    textAlign: 'center',
    paddingTop: 8,
    lineHeight: 2
  },
  fo_text: {
    marginBottom: 8,
    fontSize: 8,
  },
  disclaimer: {
    marginTop: 0,
    fontSize: 8,
    paddingLeft: 5,
    paddingBottom: 25,
  },
});

export default MyDocument;
