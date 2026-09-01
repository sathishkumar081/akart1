import { KEYS, read, write, getRoom } from './storage.js';

export const addContactSubmission = (submission) => {
  const submissions = read(KEYS.CONTACTS);
  const createdAt = new Date().toISOString();
  submissions.push({ ...submission, createdAt });
  write(KEYS.CONTACTS, submissions);
  const adminData = read(KEYS.ADMIN_DATA);
  if (adminData && !Array.isArray(adminData)) {
    const text = `${submission.subject || ''} ${submission.message || ''}`.toLowerCase();
    const issueCategory = ['Payment','Delivery','Product Quality','Tractor Rental','Drone Service','Fertilizer','Waste to Company','Account'].find(category=>text.includes(category.toLowerCase())) || 'Account';
    adminData.complaints = [...(adminData.complaints || []), { id:`TKT${Date.now()}`, submittedBy:submission.name, email:submission.email, role:submission.category || 'customer', category:issueCategory, subject:submission.subject, message:submission.message, status:'Open', createdAt }];
    adminData.notifications = [...(adminData.notifications || []), { id:`NOTE${Date.now()}`, type:'complaint', text:`New ${issueCategory} support ticket`, unread:true }];
    write(KEYS.ADMIN_DATA, adminData);
  }
  const room = getRoom(); if (room) room.collection('contact_submission').create(submission);
};
