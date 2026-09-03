const { createRng, pick, generateId, randomInt } = require('./helpers');

const FIRST_NAMES = [
  'Rahul', 'Priya', 'Amit', 'Sneha', 'Vikash', 'Pooja', 'Rohit', 'Anita',
  'Suresh', 'Neha', 'Rajesh', 'Kavita', 'Manish', 'Deepa', 'Arun', 'Sunita',
  'Sanjay', 'Meena', 'Gaurav', 'Ritu', 'Nikhil', 'Sapna', 'Vivek', 'Aarti',
  'Karan', 'Divya', 'Ajay', 'Swati', 'Pankaj', 'Nisha', 'Harish', 'Rekha',
  'Ashish', 'Pallavi', 'Rakesh', 'Jyoti', 'Manoj', 'Komal', 'Sachin', 'Shilpa',
  'Tushar', 'Bhavna', 'Ravi', 'Madhuri', 'Dinesh', 'Archana', 'Sandeep', 'Preeti',
  'Yogesh', 'Tanvi',
];

const LAST_NAMES = [
  'Sharma', 'Patel', 'Singh', 'Kumar', 'Gupta', 'Joshi', 'Verma', 'Reddy',
  'Iyer', 'Nair', 'Malhotra', 'Agarwal', 'Mehta', 'Shah', 'Rao', 'Deshmukh',
  'Kulkarni', 'Patil', 'Jadhav', 'More', 'Chauhan', 'Yadav', 'Thakur', 'Mishra',
  'Saxena', 'Dubey', 'Tiwari', 'Pandey', 'Kapoor', 'Arora', 'Bhatia', 'Grover',
  'Srivastava', 'Dwivedi', 'Chandra', 'Pillai', 'Menon', 'Krishnan', 'Banerjee', 'Ghosh',
];

const METHODS = ['upi', 'card', 'netbanking', 'wallet'];
const METHOD_WEIGHTS = [45, 30, 15, 10];

const DEVICES = ['mobile', 'desktop', 'tablet'];

function generateCustomers(count, merchantId) {
  const rng = createRng(42);
  const customers = [];

  for (let i = 1; i <= count; i++) {
    const firstName = pick(rng, FIRST_NAMES);
    const lastName = pick(rng, LAST_NAMES);
    const totalTx = randomInt(rng, 1, 40);
    const successRate = 0.6 + rng() * 0.35;
    const successful = Math.floor(totalTx * successRate);
    const failed = totalTx - successful;
    const avgOrder = pick(rng, [299, 499, 999, 1499, 2999, 4999, 7499, 12999]);

    customers.push({
      customerId: generateId('CUST', i),
      merchantId,
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@email.com`,
      phone: `+91${9000000000 + randomInt(rng, 100000, 999999999)}`,
      totalTransactions: totalTx,
      successfulTransactions: successful,
      failedTransactions: failed,
      totalSpend: successful * avgOrder,
      averageOrderValue: avgOrder,
      preferredMethod: pick(rng, METHODS),
      riskHistory: Math.floor(rng() * 15),
      deviceFingerprints: [generateId('DEV', randomInt(rng, 1, 2000))],
      firstTransactionAt: new Date(Date.now() - randomInt(rng, 30, 365) * 86400000),
      lastTransactionAt: new Date(Date.now() - randomInt(rng, 0, 14) * 86400000),
    });
  }

  return customers;
}

module.exports = { generateCustomers, FIRST_NAMES, LAST_NAMES, METHODS, METHOD_WEIGHTS, DEVICES };
