# Chair Care QR-Based Service Management System

A modern web application for managing office chair cleaning and repair services through QR code scanning and automated quoting.

## 🎯 **Core Workflow**

### 1. **QR Code Generation**
- Admins create chair records with unique QR codes
- Each chair gets a printable QR code label
- QR codes contain chair identification data

### 2. **Service Request Process**
- Users scan chair QR codes with their mobile device
- Select service type (Cleaning or Repair)
- Submit service request with description
- System automatically logs the request

### 3. **Automated Quoting**
- System calculates pricing based on service type
- Bulk discounts applied automatically:
  - **Cleaning**: 10% (5+ chairs), 15% (10+ chairs), 20% (20+ chairs)
  - **Repair**: 5% (3+ chairs), 10% (5+ chairs), 15% (10+ chairs)
- Users can request quotes for multiple chairs

### 4. **Service History Tracking**
- Complete history per chair with costs
- Status tracking: Pending → Completed → Billed
- Total spending per chair
- Service log with dates and descriptions

## ✅ **Implemented Features**

### **QR Code Management**
- **QR Code Generation** - Unique codes for each chair
- **Printable Labels** - Individual and bulk printing
- **QR Scanner** - Mobile-optimized scanning interface
- **Chair Registration** - Admin can add chairs with locations

### **Service Management**
- **Service Logging** - Track cleaning and repair requests
- **Automated Pricing** - Base prices with bulk discounts
- **Quote Generation** - Instant quotes based on chair count
- **Service History** - Complete audit trail per chair

### **User Management**
- **Role-Based Access** - Admin and Client roles
- **Client Dashboard** - View own chairs and service history
- **Admin Dashboard** - Manage all chairs and generate QR codes
- **Mobile-First Design** - Optimized for scanning on phones

### **Pricing Structure**
- **Cleaning**: R150 base price per chair
- **Repair**: R350 base price per chair
- **Bulk Discounts**: Automatic application based on quantity
- **Quote Validity**: 7 days from generation

## 📱 **User Experience**

### **Client Workflow**
1. Login with credentials
2. View dashboard with chair overview
3. Scan QR code on any chair
4. Request cleaning or repair service
5. View service history and costs
6. Get automatic quotes for multiple chairs

### **Admin Workflow**
1. Login with admin credentials
2. Add new chairs to the system
3. Generate and print QR code labels
4. Monitor all service requests
5. View system-wide statistics

## 🔧 **Technical Implementation**

### **QR Code System**
- **Library**: qrcode npm package
- **Format**: JSON with chair ID and metadata
- **Scanning**: Text input (camera integration ready)
- **Printing**: Formatted labels with chair details

### **Database Structure**
```typescript
Chair {
  id, qrCode, chairNumber, location, model, userId
}

ServiceLog {
  id, chairId, userId, serviceType, description, cost, status
}

Quote {
  id, userId, chairIds, serviceType, totalCost, discount, finalCost
}
```

### **Pricing Engine**
- Configurable base prices per service type
- Automatic bulk discount calculation
- Quote generation with validity periods
- Cost tracking per chair and user

## 🚀 **Ready for Firebase Integration**

The application is designed with Firebase in mind:

### **Current Static Data**
- Mock users and chairs in `src/lib/database.ts`
- In-memory service logs and quotes
- Static pricing configuration

### **Firebase Migration Path**
1. **Replace** `src/lib/database.ts` with Firebase functions
2. **Update** API endpoints to use Firestore
3. **Add** Firebase Authentication
4. **Configure** Firebase Storage for photos
5. **Deploy** to Firebase Hosting

### **Firebase Collections Structure**
```
users/          - User accounts and profiles
chairs/         - Chair registry with QR codes
serviceLogs/    - Service request history
quotes/         - Generated quotes
pricing/        - Service pricing configuration
```

## 💰 **Business Value**

### **Immediate Benefits**
- **Streamlined Service Requests** - No phone calls or emails needed
- **Automatic Pricing** - Consistent quotes with bulk discounts
- **Complete Audit Trail** - Track all services per chair
- **Mobile Accessibility** - Scan and request from anywhere

### **Cost Savings**
- **Reduced Admin Time** - Automated quote generation
- **Bulk Discounts** - Encourage larger service orders
- **Efficient Tracking** - Know exactly what was spent per chair
- **Professional Image** - Modern QR-based system

## 📊 **Demo Data**

### **Users**
- **Admin**: `admin@chaircare.co.za` / `password`
- **Client**: `client@company.co.za` / `password`

### **Sample Chairs**
- **CH-001**: Office Floor 1 - Desk 5 (Executive Chair)
- **CH-002**: Office Floor 1 - Desk 8 (Task Chair)

### **Pricing**
- **Cleaning**: R150 per chair
- **Repair**: R350 per chair
- **Bulk discounts** automatically applied

## 🔄 **Next Steps**

### **Phase 1: Firebase Integration** (Week 1-2)
1. Set up Firebase project
2. Migrate data structure to Firestore
3. Implement Firebase Authentication
4. Deploy to Firebase Hosting

### **Phase 2: Enhanced Features** (Week 3-4)
1. Photo upload for service requests
2. Email notifications for quotes
3. Payment integration
4. Advanced reporting

### **Phase 3: Mobile App** (Month 2)
1. Native camera QR scanning
2. Offline capability
3. Push notifications
4. App store deployment

---

**The Chair Care QR system transforms traditional service management into a modern, efficient, and user-friendly experience that scales with your business needs.**
