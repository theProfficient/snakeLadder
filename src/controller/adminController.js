const mongoose = require("mongoose");
const adminModel = require("../model/adminModel");

const createAdmin = async function (req, res) {
  try {
    let bodyData = req.body;
    let { adminName, email, password } = bodyData;
    if (Object.keys(bodyData).length === 0) {
      return res.status(400).send({
        status: false,
        message: "please provide all the field name,email, password ",
      });
    }
    const adminExist = await adminModel.findOne({
      email: email,
      password: password,
    });
    if (adminExist) {
      return res.status(200).send({
        status: true,
        message: "admin is already register",
        data: adminExist,
      });
    }
    const adminCreated = await adminModel.create(bodyData);
    return res.status(201).json(adminCreated);
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const adminLoggedin = async function (req, res) {
  try {
    let { email, password } = req.body;
    const checkAdmin = await adminModel.findOne({ email: email });
    if (!email || !password) {
      return res
        .status(400)
        .send({
          status: false,
          message: "please provide both email and password ",
        });
    }
    if (checkAdmin && checkAdmin.password === password) {
      res.status(200).json({ success: true, data: checkAdmin });
    } else {
      res.status(200).json({ success: false, message: "credential failed" });
    }
  } catch (error) {
    return res.status(500).send({ status: "false", message: error.message });
  }
};

module.exports = { createAdmin, adminLoggedin };
