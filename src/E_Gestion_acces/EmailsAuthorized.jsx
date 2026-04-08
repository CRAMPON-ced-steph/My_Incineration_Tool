
 export {
getAuthorizedEmails,
saveAuthorizedEmails


 }
 
 const getAuthorizedEmails = () => {
  const stored = localStorage.getItem('authorizedEmails');
  if (stored) {
    const parsed = JSON.parse(stored);
    // Convert date strings back to Date objects
    return parsed.map(item => ({
      ...item,
      validUntil: new Date(item.validUntil)
    }));
  }
  return [
    { 
      email: "cedric.crampon@gmail.com", 
      validUntil: new Date('2099-12-31') 
    },
    { 
      email: "admin@example.com", 
      validUntil: new Date('2024-12-31') 
    },
    { 
      email: "manager@company.com", 
      validUntil: new Date('2025-06-30') 
    }
  ];
};



const saveAuthorizedEmails = (emails) => {
  localStorage.setItem('authorizedEmails', JSON.stringify(emails));
};

