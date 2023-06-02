const midtransClient = require("midtrans-client");

class paymentController {
  static async generateMitransToken(req, res, next) {
    try {
      const { id } = req.user;

      const user = await User.findByPk(id);

      if (user.isPremium) throw { name: "AlreadySubscribe" };

      // will change to date.now()
      const order_id =
        "TRANS_" +
        id +
        tokenKey() +
        (Math.floor(Math.random() * 90000) + 10000);

      // DATE NOW()-(ID DI DB)

      let snap = new midtransClient.Snap({
        // Set to true if you want Production Environment (accept real transaction).
        isProduction: false,
        serverKey: process.env.MIDTRANS_KEY,
      });

      let parameter = {
        transaction_details: {
          order_id: order_id,
          gross_amount: 50000,
        },
        credit_card: {
          secure: true,
        },
        customer_details: {
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
      };

      const mitrans_token = await snap.createTransaction(parameter);

      res.status(200).json({
        token: mitrans_token.token,
      });
    } catch (err) {
      next(err);
    }
  }

  static async subscription(req, res, next) {
    try {
      const { id } = req.user;
      const user = await User.update(
        {
          isPremium: true,
        },
        {
          where: {
            id,
          },
        }
      );
      res.status(200).json({
        message: "You are premium now",
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = paymentController;
