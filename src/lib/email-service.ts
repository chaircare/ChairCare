// Email Service for Chair Care Application
import { Job, User } from 'types/chair-care';

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text: string;
}

class EmailService {
  constructor() {
    // Email service configuration would go here in production
  }

  // Job-related email templates
  generateJobAssignedEmail(job: Job, technician: User): EmailTemplate {
    const subject = `New Job Assignment - ${job.jobId}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .job-details { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
          .button { display: inline-block; background: #14b8a6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔧 New Job Assignment</h1>
            <p>You have been assigned a new service job</p>
          </div>
          <div class="content">
            <p>Hello ${technician.name},</p>
            <p>You have been assigned to a new chair service job. Please review the details below:</p>
            
            <div class="job-details">
              <h3>Job Details</h3>
              <p><strong>Job ID:</strong> ${job.jobId}</p>
              <p><strong>Client:</strong> ${job.clientName}</p>
              <p><strong>Service Type:</strong> ${job.jobType}</p>
              <p><strong>Location:</strong> ${job.location || 'Client site'}</p>
              <p><strong>Scheduled Date:</strong> ${job.scheduledDate?.toLocaleDateString('en-ZA') || 'To be scheduled'}</p>
              <p><strong>Number of Chairs:</strong> ${job.chairs?.length || 1}</p>
              ${job.adminNotes ? `<p><strong>Notes:</strong> ${job.adminNotes}</p>` : ''}
            </div>
            
            <p>Please log into the system to view full job details and update the status when you begin work.</p>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/jobs/${job.id}/technician" class="button">
              View Job Details
            </a>
            
            <p>If you have any questions, please contact your supervisor or the admin team.</p>
            
            <p>Best regards,<br>Chair Care Solutions Team</p>
          </div>
          <div class="footer">
            <p>Chair Care Solutions | Professional Chair Maintenance Services</p>
            <p>Cape Town, South Africa | +27 21 123 4567</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      New Job Assignment - ${job.jobId}
      
      Hello ${technician.name},
      
      You have been assigned to a new chair service job:
      
      Job ID: ${job.jobId}
      Client: ${job.clientName}
      Service Type: ${job.jobType}
      Location: ${job.location || 'Client site'}
      Scheduled Date: ${job.scheduledDate?.toLocaleDateString('en-ZA') || 'To be scheduled'}
      Number of Chairs: ${job.chairs?.length || 1}
      ${job.adminNotes ? `Notes: ${job.adminNotes}` : ''}
      
      Please log into the system to view full details and update the status when you begin work.
      
      View Job: ${process.env.NEXT_PUBLIC_APP_URL}/jobs/${job.id}/technician
      
      Best regards,
      Chair Care Solutions Team
    `;

    return { subject, html, text };
  }

  generateJobCompletedEmail(job: Job, client: User, totalCost: number): EmailTemplate {
    const subject = `Service Completed - ${job.jobId}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .service-summary { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
          .cost-summary { background: #e6f7ff; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #14b8a6; }
          .button { display: inline-block; background: #14b8a6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Service Completed</h1>
            <p>Your chair service has been completed successfully</p>
          </div>
          <div class="content">
            <p>Dear ${client.name},</p>
            <p>We're pleased to inform you that your chair service has been completed successfully.</p>
            
            <div class="service-summary">
              <h3>Service Summary</h3>
              <p><strong>Job ID:</strong> ${job.jobId}</p>
              <p><strong>Service Type:</strong> ${job.jobType}</p>
              <p><strong>Completed Date:</strong> ${job.completedAt?.toLocaleDateString('en-ZA') || new Date().toLocaleDateString('en-ZA')}</p>
              <p><strong>Technician:</strong> ${job.assignedTechnicianName || 'Professional Technician'}</p>
              <p><strong>Chairs Serviced:</strong> ${job.chairs?.length || 1}</p>
            </div>
            
            <div class="cost-summary">
              <h3>Service Cost</h3>
              <p><strong>Total Cost:</strong> R${totalCost.toFixed(2)}</p>
              <p>An invoice will be sent separately for your records.</p>
            </div>
            
            <p>Your chairs are now ready for use. We recommend regular maintenance to keep them in optimal condition.</p>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/client/dashboard" class="button">
              View Service History
            </a>
            
            <p>Thank you for choosing Chair Care Solutions. If you have any questions or need additional services, please don't hesitate to contact us.</p>
            
            <p>Best regards,<br>Chair Care Solutions Team</p>
          </div>
          <div class="footer">
            <p>Chair Care Solutions | Professional Chair Maintenance Services</p>
            <p>Cape Town, South Africa | +27 21 123 4567 | info@chaircare.co.za</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Service Completed - ${job.jobId}
      
      Dear ${client.name},
      
      Your chair service has been completed successfully.
      
      Service Summary:
      Job ID: ${job.jobId}
      Service Type: ${job.jobType}
      Completed Date: ${job.completedAt?.toLocaleDateString('en-ZA') || new Date().toLocaleDateString('en-ZA')}
      Technician: ${job.assignedTechnicianName || 'Professional Technician'}
      Chairs Serviced: ${job.chairs?.length || 1}
      
      Total Cost: R${totalCost.toFixed(2)}
      An invoice will be sent separately for your records.
      
      Your chairs are now ready for use. We recommend regular maintenance to keep them in optimal condition.
      
      View Service History: ${process.env.NEXT_PUBLIC_APP_URL}/client/dashboard
      
      Thank you for choosing Chair Care Solutions.
      
      Best regards,
      Chair Care Solutions Team
    `;

    return { subject, html, text };
  }

  generateInvoiceEmail(invoiceNumber: string, invoiceId: string, client: User, total: number, dueDate: Date): EmailTemplate {
    const subject = `Invoice ${invoiceNumber} - Chair Care Services`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .invoice-details { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
          .amount-due { background: #fff3cd; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #ffc107; }
          .button { display: inline-block; background: #14b8a6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💰 Invoice Ready</h1>
            <p>Your invoice for chair care services</p>
          </div>
          <div class="content">
            <p>Dear ${client.name},</p>
            <p>Thank you for choosing Chair Care Solutions. Please find your invoice details below:</p>
            
            <div class="invoice-details">
              <h3>Invoice Information</h3>
              <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
              <p><strong>Issue Date:</strong> ${new Date().toLocaleDateString('en-ZA')}</p>
              <p><strong>Due Date:</strong> ${dueDate.toLocaleDateString('en-ZA')}</p>
            </div>
            
            <div class="amount-due">
              <h3>Amount Due</h3>
              <p style="font-size: 24px; font-weight: bold; color: #d63384;">R${total.toFixed(2)}</p>
            </div>
            
            <p>Payment can be made via:</p>
            <ul>
              <li>Bank Transfer (details on invoice)</li>
              <li>Credit Card (contact us for payment link)</li>
              <li>Cash on delivery (if arranged)</li>
            </ul>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/invoices/${invoiceId}" class="button">
              View Full Invoice
            </a>
            
            <p>If you have any questions about this invoice, please contact our billing department.</p>
            
            <p>Thank you for your business!</p>
            
            <p>Best regards,<br>Chair Care Solutions Billing Team</p>
          </div>
          <div class="footer">
            <p>Chair Care Solutions | Professional Chair Maintenance Services</p>
            <p>Cape Town, South Africa | +27 21 123 4567 | billing@chaircare.co.za</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Invoice ${invoiceNumber} - Chair Care Services
      
      Dear ${client.name},
      
      Thank you for choosing Chair Care Solutions. Your invoice is ready:
      
      Invoice Number: ${invoiceNumber}
      Issue Date: ${new Date().toLocaleDateString('en-ZA')}
      Due Date: ${dueDate.toLocaleDateString('en-ZA')}
      
      Amount Due: R${total.toFixed(2)}
      
      Payment can be made via:
      - Bank Transfer (details on invoice)
      - Credit Card (contact us for payment link)
      - Cash on delivery (if arranged)
      
      View Invoice: ${process.env.NEXT_PUBLIC_APP_URL}/invoices/${invoiceId}
      
      If you have any questions, please contact our billing department.
      
      Thank you for your business!
      
      Best regards,
      Chair Care Solutions Billing Team
    `;

    return { subject, html, text };
  }

  generateLowStockAlert(itemName: string, currentStock: number, reorderPoint: number): EmailTemplate {
    const subject = `🚨 Low Stock Alert - ${itemName}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .alert-details { background: #fff3cd; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #ffc107; }
          .button { display: inline-block; background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 Low Stock Alert</h1>
            <p>Immediate attention required</p>
          </div>
          <div class="content">
            <p>Dear Admin,</p>
            <p>This is an automated alert to inform you that an inventory item is running low and requires immediate attention.</p>
            
            <div class="alert-details">
              <h3>Stock Alert Details</h3>
              <p><strong>Item:</strong> ${itemName}</p>
              <p><strong>Current Stock:</strong> ${currentStock} units</p>
              <p><strong>Reorder Point:</strong> ${reorderPoint} units</p>
              <p><strong>Status:</strong> ${currentStock === 0 ? 'OUT OF STOCK' : 'LOW STOCK'}</p>
            </div>
            
            <p><strong>Action Required:</strong> Please reorder this item immediately to avoid service disruptions.</p>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/inventory" class="button">
              Manage Inventory
            </a>
            
            <p>This alert was generated automatically by the Chair Care inventory management system.</p>
          </div>
          <div class="footer">
            <p>Chair Care Solutions | Inventory Management System</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Low Stock Alert - ${itemName}
      
      Dear Admin,
      
      This is an automated alert for low inventory:
      
      Item: ${itemName}
      Current Stock: ${currentStock} units
      Reorder Point: ${reorderPoint} units
      Status: ${currentStock === 0 ? 'OUT OF STOCK' : 'LOW STOCK'}
      
      Action Required: Please reorder this item immediately to avoid service disruptions.
      
      Manage Inventory: ${process.env.NEXT_PUBLIC_APP_URL}/admin/inventory
      
      This alert was generated automatically by the Chair Care inventory management system.
    `;

    return { subject, html, text };
  }

  // Send email function (would integrate with actual email service)
  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      // In a real implementation, this would integrate with SendGrid, Mailgun, etc.
      console.log('Sending email:', {
        to: emailData.to,
        subject: emailData.subject,
        // Don't log full content in production
      });

      // Simulate email sending
      if (process.env.NODE_ENV === 'development') {
        console.log('Email content (DEV MODE):');
        console.log('Subject:', emailData.subject);
        console.log('To:', emailData.to);
        console.log('Text:', emailData.text.substring(0, 200) + '...');
      }

      // Here you would integrate with your email service:
      /*
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(this.apiKey);
      
      const msg = {
        to: emailData.to,
        from: {
          email: this.fromEmail,
          name: this.fromName
        },
        subject: emailData.subject,
        text: emailData.text,
        html: emailData.html,
      };
      
      await sgMail.send(msg);
      */

      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  // Convenience methods for sending specific email types
  async sendJobAssignedNotification(job: Job, technician: User): Promise<boolean> {
    const template = this.generateJobAssignedEmail(job, technician);
    return this.sendEmail({
      to: technician.email,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  async sendJobCompletedNotification(job: Job, client: User, totalCost: number): Promise<boolean> {
    const template = this.generateJobCompletedEmail(job, client, totalCost);
    return this.sendEmail({
      to: client.email,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  async sendInvoiceNotification(invoiceNumber: string, invoiceId: string, client: User, total: number, dueDate: Date): Promise<boolean> {
    const template = this.generateInvoiceEmail(invoiceNumber, invoiceId, client, total, dueDate);
    return this.sendEmail({
      to: client.email,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  async sendLowStockNotification(adminEmail: string, itemName: string, currentStock: number, reorderPoint: number): Promise<boolean> {
    const template = this.generateLowStockAlert(itemName, currentStock, reorderPoint);
    return this.sendEmail({
      to: adminEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  async sendServiceRequestNotification(adminEmail: string, requestData: any): Promise<boolean> {
    const subject = `🔧 New Service Request - Chair ${requestData.chairId}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .request-details { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
          .button { display: inline-block; background: #14b8a6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔧 New Service Request</h1>
            <p>A new chair service request has been submitted</p>
          </div>
          <div class="content">
            <p>Dear Admin,</p>
            <p>A new service request has been submitted and requires your attention.</p>
            
            <div class="request-details">
              <h3>Request Details</h3>
              <p><strong>Chair ID:</strong> ${requestData.chairId}</p>
              <p><strong>Location:</strong> ${requestData.location}</p>
              <p><strong>Client:</strong> ${requestData.clientName}</p>
              <p><strong>Issue:</strong> ${requestData.issueDescription}</p>
              <p><strong>Priority:</strong> ${requestData.priority || 'Normal'}</p>
              <p><strong>Photos:</strong> ${requestData.photoCount || 0} uploaded</p>
            </div>
            
            <p>Please review this request and schedule appropriate service.</p>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/service-requests" class="button">
              View Service Requests
            </a>
            
            <p>This notification was generated automatically by the Chair Care system.</p>
          </div>
          <div class="footer">
            <p>Chair Care Solutions | Service Request System</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      New Service Request - Chair ${requestData.chairId}
      
      Dear Admin,
      
      A new service request has been submitted:
      
      Chair ID: ${requestData.chairId}
      Location: ${requestData.location}
      Client: ${requestData.clientName}
      Issue: ${requestData.issueDescription}
      Priority: ${requestData.priority || 'Normal'}
      Photos: ${requestData.photoCount || 0} uploaded
      
      Please review this request and schedule appropriate service.
      
      View Service Requests: ${process.env.NEXT_PUBLIC_APP_URL}/admin/service-requests
      
      This notification was generated automatically by the Chair Care system.
    `;

    return this.sendEmail({
      to: adminEmail,
      subject,
      html,
      text
    });
  }
}

export const emailService = new EmailService();