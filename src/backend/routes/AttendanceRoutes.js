const express = require('express');

const router = express.Router();

const Attendance =
require('../models/Attendance');


// LOGIN
router.post('/login', async (req, res) => {

  try {

    const {
      employee_uid,
      employee_name
    } = req.body;

    if (!employee_uid) {

      return res.status(400).json({
        message: 'Employee UID missing'
      });

    }

    // CHECK EXISTING ONLINE SESSION

    let attendance =
      await Attendance.findOne({

        employee_uid,

        status: {
          $ne: 'Offline'
        }

      });

    // IF ALREADY ONLINE

    if (attendance) {

      return res.json({

        success: true,

        attendanceId:
          attendance._id,

        alreadyLoggedIn: true

      });

    }

    // CREATE NEW SESSION

    attendance =
      await Attendance.create({

        employee_uid,

        employee_name:
          employee_name || 'Employee',

        login_time:
          new Date(),

        status:
          'Online'

      });

    res.json({

      success: true,

      attendanceId:
        attendance._id

    });

  } catch (error) {

    console.log(
      'LOGIN ERROR:',
      error
    );

    res.status(500).json({

      error:
        error.message

    });

  }

});


// BREAK

router.put('/break/:id', async (req, res) => {

  try {

    await Attendance.findByIdAndUpdate(

      req.params.id,

      {

        break_start:
          new Date(),

        status: 'Break'

      }

    );

    res.json({

      success: true

    });

  } catch (error) {

    res.status(500).json(error);

  }

});


// RESUME

router.put('/resume/:id', async (req, res) => {

  try {

    await Attendance.findByIdAndUpdate(

      req.params.id,

      {

        break_end:
          new Date(),

        status: 'Online'

      }

    );

    res.json({

      success: true

    });

  } catch (error) {

    res.status(500).json(error);

  }

});


// LOGOUT

router.put('/logout/:id', async (req, res) => {

  try {

    const {
      totalSeconds
    } = req.body;

    await Attendance.findByIdAndUpdate(

      req.params.id,

      {

        logout_time:
          new Date(),

        total_work_seconds:
          totalSeconds,

        status:
          'Offline'

      }

    );

    res.json({

      success: true

    });

  } catch (error) {

    res.status(500).json(error);

  }

});


// ACTIVE EMPLOYEES

router.get('/active', async (req, res) => {

  try {

    const employees =
      await Attendance.find({

        status: {
          $ne: 'Offline'
        }

      }).sort({

        login_time: -1

      });

    res.json(employees);

  } catch (error) {

    res.status(500).json(error);

  }

});


// HISTORY

router.get('/history', async (req, res) => {

  try {

    const history =
      await Attendance.find()
      .sort({
        createdAt: -1
      });

    res.json(history);

  } catch (error) {

    res.status(500).json(error);

  }

});

module.exports = router;