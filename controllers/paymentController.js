const midtransClient = require("midtrans-client");
const { User, Transaction } = require("../models");
const axios = require("axios");

class paymentController {
  static async generateMidtransToken(req, res, next) {
    try {
      const { id } = req.user;
      const { length } = req.query;

      const user = await User.findByPk(id);

      if (!user) {
        throw { name: "NotFound" };
      }

      console.log(length, "INI LENGTH");
      console.log(user, "INI FOUND USER");

      let amount = 0;
      let product = 0;

      if (!length || isNaN(length)) {
        throw { name: "InvalidAmount" };
      } else if (length === "30") {
        console.log("CASE 1");
        amount = 300000;
        product = 30;
      } else if (length === "180") {
        console.log("CASE 2");
        amount = 1200000;
        product = 180;
      } else if (length === "365") {
        console.log("CASE 3");
        amount = 2000000;
        product = 360;
      }

      const newPayment = await Transaction.create({
        UserId: +id,
        amount: +amount,
        ProductId: +product,
        status: "pending",
      });

      console.log(newPayment, "INI NEW PAYMENT");

      const now = Date.now();

      const orderId = `${now}-D${newPayment.id}-${length}`;

      console.log(orderId, "INI ORDER ID");

      const headerRequest = {
        transaction_details: {
          order_id: orderId,
          gross_amount: +amount,
        },
      };

      console.log(process.env.MIDTRANS_AUTH, "INI MIDTRANS AUTH");

      const midtransResponse = await axios.post(
        "https://app.sandbox.midtrans.com/snap/v1/transactions",
        headerRequest,
        {
          headers: {
            Authorization: `${process.env.MIDTRANS_AUTH}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(midtransResponse, "INI MIDTRANS RESPONSE");

      if (midtransResponse.error_messages) {
        throw new Error(midtransResponse.error_messages, "INI ERROR MIDTRANS");
      }

      const updatePayUrl = await Transaction.update(
        {
          paymentUrl: midtransResponse.data.redirect_url,
          token: midtransResponse.data.token,
          orderId: orderId,
        },
        { where: { id: +newPayment.id } }
      );

      res.status(201).json({
        token: midtransResponse.data.token,
        paymentUrl: midtransResponse.data.redirect_url,
      });
    } catch (err) {
      next(err);
    }
  }

  static async paymentNotification(req, res, next) {
    try {
      console.log(req.body, "INI KEMBALIAN MIDTRANS");

      const { order_id, transaction_status, transaction_id } = req.body;

      console.log(order_id, "INI ORDER ID");
      console.log(transaction_status, "INI TRANSACTION STATUS");
      console.log(transaction_id, "INI TRANSACTION ID");

      const splitPayment = order_id.split("-");

      console.log(splitPayment, "INI SPLIT PAYMENT");

      const paymentId = splitPayment[1].substring(1);

      const findTransaction = await Transaction.findByPk(+paymentId);

      console.log(paymentId, "INI PAYMENT ID");

      if (!findTransaction) {
        throw { name: "NotFound" };
      }

      // check signature to midtrans
      // const transactionData = await axios.get(
      //   `https://api.sandbox.midtrans.com/v2/${order_id}/status`,
      //   {
      //     headers: {
      //       Accept: "application/json",
      //       "Content-Type": "application/json",
      //       Authorization: `${process.env.MIDTRANS_AUTH}`,
      //     },
      //   }
      // );

      // const transactionId = transactionData.data.transaction_id;

      // if (transactionId !== transaction_id) {
      //   throw new Error("CANNOT_ACCESS");
      // }

      if (
        transaction_status === "settlement" ||
        transaction_status === "capture"
      ) {
        const transactionSettlement = await Transaction.update(
          {
            status: "paid",
          },
          {
            where: {
              id: +paymentId,
            },
          },
          {
            include: {
              attributes: ["amount"],
            },
          }
        );

        let totalDays = splitPayment[2];

        console.log(totalDays, "INI TOTAL DAYS");

        let expiredDate = new Date().getDay() + Number(totalDays);
        expiredDate = new Date(expiredDate);

        const updateBalance = await User.update(
          {
            premiumExpiry: expiredDate,
          },
          {
            where: {
              id: +findTransaction.UserId,
            },
          }
        );

        res.status(200).json({
          message: `${totalDays} days added to User ID ${findTransaction.UserId} subscription`,
        });
      } else if (
        transaction_status === "deny" ||
        transaction_status === "cancel" ||
        transaction_status === "expire"
      ) {
        const transactionSettlement = await Transaction.update(
          {
            status: "failed",
          },
          {
            where: {
              id: +paymentId,
            },
          }
        );

        res.status(200).json({
          message: `Transaction has been cancelled`,
        });
      }
    } catch (err) {
      next(err);
    }
  }
}

module.exports = paymentController;
