import React, { useState } from 'react';
import { Page, Card, DataTable, Button, Modal } from '@shopify/polaris';
import { useLoaderData } from '@remix-run/react';
import { json } from '@remix-run/react';
import shopify from '../shopify.server';
import GenerateWaybill from './app.generateWaybill';

export async function loader({ request }) {
  const { admin, session } = await shopify.authenticate.admin(request);
  const data = await admin.rest.resources.Order.all({ session: session, status: "any" });
  return json(data.data);
}

// Helper function to format the order date
const formatOrderDate = (date) => {
  const orderDate = new Date(date);
  return `${orderDate.toLocaleDateString()} at ${orderDate.toLocaleTimeString()}`;
};

// Helper function to format the order total price with currency symbol
const formatTotalPrice = (amount, currencyCode) => {
  const currencySymbol = currencyCode === 'INR' ? '₹' : '$';
  return `${currencySymbol}${amount}`;
};

// Function to format the order data
const formatOrderData = (order, handleWaybillClick) => {
  return [
    order.order_number || 'N/A',
    formatOrderDate(order.created_at),
    `${order.customer.first_name || 'N/A'} ${order.customer.last_name || 'N/A'}`,
    formatTotalPrice(order.current_total_price, order.currency),
    order.financial_status || 'N/A',
    `${order.line_items.length} items`,
    <Button onClick={() => handleWaybillClick(order)}>Generate Waybill</Button>
  ];
};

export default function Index() {
  const orders = useLoaderData();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Handle waybill generation click
  const handleWaybillClick = (order) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  // Format rows for the DataTable
  const rows = orders.map(order => formatOrderData(order, handleWaybillClick));

  return (
    <Page title="Orders">
      <Card>
        <DataTable
          columnContentTypes={[
            'text',   // Order
            'text',   // Date
            'text',   // Customer
            'text',   // Total
            'text',   // Payment status
            'text',   // Items
            'text'    // Actions (Button)
          ]}
          headings={[
            'Order',
            'Date & Time',
            'Customer',
            'Total',
            'Payment Status',
            'Items',
            'Actions'
          ]}
          rows={rows}
        />
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Generate Waybill"
          primaryAction={{
            content: 'Close',
            onAction: () => setModalOpen(false),
          }}
        >
          <Modal.Section>
            {selectedOrder && (
              <GenerateWaybill
                order={selectedOrder}
                onClose={() => setModalOpen(false)} // Close handler to reset selectedOrder
              />
            )}
          </Modal.Section>
        </Modal>
      </Card>
    </Page>
  );
}
