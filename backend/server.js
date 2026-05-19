const express = require("express");
const fs = require("fs");
const app = express();

app.use(express.json());

const FILE = "./invoices.json";

app.post("/invoice", (req, res) => {
  const invoices = JSON.parse(fs.readFileSync(FILE));
  invoices.unshift(req.body);
  fs.writeFileSync(FILE, JSON.stringify(invoices, null, 2));
  res.json({ success: true });
});

app.get("/invoices", (req, res) => {
  const invoices = JSON.parse(fs.readFileSync(FILE));
  res.json(invoices);
});

app.listen(5000, () => console.log("✅ Invoice backend running"));





// // server.js
// const express = require("express");
// const Razorpay = require("razorpay");
// const cors = require("cors");

// const app = express();
// app.use(cors());
// app.use(express.json());

// const razorpay = new Razorpay({
//   key_id: "rzp_test_Rs9A3tgCb75x3G",
//   key_secret: "zu5k6743qaDdaDhrdHVVke7T",
// });

// // STEP 2.1 – Create Order
// app.post("/create-order", async (req, res) => {
//   try {
//     const { amount } = req.body;

//     const order = await razorpay.orders.create({
//       amount: amount * 100, // ₹ to paise
//       currency: "INR",
//       receipt: "receipt_test_01",
//     });

//     res.json(order);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// app.listen(5000, () =>
//   console.log("🚀 Razorpay Test Server running on port 5000")
// );
