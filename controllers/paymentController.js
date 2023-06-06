const midtransClient = require("midtrans-client");
const { User, Transaction } = require("../models");
const axios = require("axios");

class paymentController {
  static async generateMidtransToken(req, res, next) {
    try {
      const { id } = req.user;
      const { length } = req.body;

      const user = await User.findByPk(id);

      if (!user) {
        throw { name: "NotFound" };
      }

      let amount = 0;
      let product = 0;

      if (length === "30") {
        amount = 300000;
        product = 30;
      } else if (length === "180") {
        amount = 1200000;
        product = 180;
      } else if (length === "365") {
        amount = 2000000;
        product = 360;
      } else {
        throw { name: "InvalidAmount" };
      }

      const newPayment = await Transaction.create({
        UserId: +id,
        amount: +amount,
        ProductId: +product,
        status: "pending",
      });

      const now = Date.now();
      const orderId = `${now}-D${newPayment.id}-${length}`;

      const headerRequest = {
        transaction_details: {
          order_id: orderId,
          gross_amount: +amount,
        },
      };

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
      const { order_id, transaction_status, transaction_id } = req.body;
      const splitPayment = order_id.split("-");
      const paymentId = splitPayment[1].substring(1);
      const findTransaction = await Transaction.findByPk(+paymentId);

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
