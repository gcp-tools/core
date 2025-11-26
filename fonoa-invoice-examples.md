# Fonoa Invoice API Examples

## Belgium Invoice POST Request

```http
POST https://api.fonoa.com/v1/invoices
Content-Type: application/json
Authorization: fks_gspPtg_ARU6zynGMDq3zpZfYo7vZ6lX9gltjb08

{
  "country_code": "BE",
  "currency_code": "EUR",
  "invoice_date": "2025-01-15",
  "due_date": "2025-02-14",
  "invoice_number": "INV-BE-2025-001",
  "supplier": {
    "name": "Acme Corporation BV",
    "tax_id": "BE0123456789",
    "address": {
      "street": "Rue de la Loi 16",
      "city": "Brussels",
      "postal_code": "1000",
      "country": "BE"
    },
    "email": "billing@acme.be"
  },
  "customer": {
    "name": "Belgian Customer SA",
    "tax_id": "BE9876543210",
    "address": {
      "street": "Avenue Louise 123",
      "city": "Brussels",
      "postal_code": "1050",
      "country": "BE"
    },
    "email": "accounts@customer.be"
  },
  "items": [
    {
      "description": "Professional Consulting Services",
      "quantity": 10,
      "unit": "hour",
      "unit_price": 150.00,
      "tax_rate": 21.00,
      "amount": 1500.00,
      "tax_amount": 315.00,
      "total_amount": 1815.00
    }
  ],
  "subtotal": 1500.00,
  "tax_amount": 315.00,
  "total_amount": 1815.00,
  "payment_terms": "Payment due within 30 days",
  "payment_method": "Bank transfer",
  "notes": "Invoice compliant with Belgian VAT requirements"
}
```

**Belgium-Specific Requirements:**
- VAT number format: `BE` followed by 10 digits (with leading zero if needed)
- Standard VAT rate: 21% (reduced rates: 6% and 12% for specific goods/services)
- Currency: EUR
- Must include supplier and customer VAT numbers
- Address must include postal code

## Mexico Invoice POST Request

```http
POST https://api.fonoa.com/v1/invoices
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "country_code": "MX",
  "currency_code": "MXN",
  "invoice_date": "2025-01-15",
  "due_date": "2025-02-14",
  "invoice_number": "INV-MX-2025-001",
  "supplier": {
    "name": "Acme Corporation S.A. de C.V.",
    "tax_id": "ACM850101ABC",
    "address": {
      "street": "Av. Insurgentes Sur 1647",
      "city": "Ciudad de México",
      "state": "CDMX",
      "postal_code": "03920",
      "country": "MX"
    },
    "email": "facturacion@acme.mx"
  },
  "customer": {
    "name": "Cliente Mexicano S.A. de C.V.",
    "tax_id": "CLM900101XYZ",
    "address": {
      "street": "Calle Reforma 123",
      "city": "Ciudad de México",
      "state": "CDMX",
      "postal_code": "06600",
      "country": "MX"
    },
    "email": "contabilidad@cliente.mx"
  },
  "items": [
    {
      "description": "Servicios de Consultoría Profesional",
      "quantity": 20,
      "unit": "hora",
      "unit_price": 2000.00,
      "tax_rate": 16.00,
      "amount": 40000.00,
      "tax_amount": 6400.00,
      "total_amount": 46400.00
    }
  ],
  "subtotal": 40000.00,
  "tax_amount": 6400.00,
  "total_amount": 46400.00,
  "payment_terms": "Pago a 30 días",
  "payment_method": "Transferencia bancaria",
  "cfdi_use": "G03",
  "payment_form": "03",
  "notes": "Factura electrónica CFDI conforme a normativa mexicana"
}
```

**Mexico-Specific Requirements:**
- Tax ID format: RFC (Registro Federal de Contribuyentes) - 12-13 characters (e.g., `ABC850101XYZ`)
- Standard VAT rate: 16% (IVA - Impuesto al Valor Agregado)
- Currency: MXN
- Must comply with CFDI (Comprobante Fiscal Digital por Internet) requirements
- CFDI Use Code required (e.g., `G03` for general use)
- Payment Form Code required (e.g., `03` for bank transfer)
- Address must include state (estado)
- Electronic invoice must be issued in XML format (Fonoa handles this)

## Common Notes

- Replace `YOUR_API_KEY` with your actual Fonoa API key
- Invoice dates should be in ISO 8601 format (YYYY-MM-DD)
- All monetary amounts should be in the specified currency
- Tax calculations should follow local regulations
- Ensure all required fields are present for compliance

