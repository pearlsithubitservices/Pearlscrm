const express = require("express");

const router = express.Router();

const Conversation = require("../../models/Conversation");
function getDateRange(period) {
  const now = new Date();

  // -------------------------------------------------------
  // TODAY - UTC
  // -------------------------------------------------------

  const todayStart = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      0,
      0,
      0,
      0
    )
  );

  const todayEnd = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      23,
      59,
      59,
      999
    )
  );

  // -------------------------------------------------------
  // TODAY
  // -------------------------------------------------------

  if (period === "today") {
    return {
      start: todayStart,
      end: todayEnd,
    };
  }

  // -------------------------------------------------------
  // YESTERDAY
  // -------------------------------------------------------

  if (period === "yesterday") {
    const start = new Date(todayStart);

    start.setUTCDate(
      start.getUTCDate() - 1
    );

    const end = new Date(todayEnd);

    end.setUTCDate(
      end.getUTCDate() - 1
    );

    return {
      start,
      end,
    };
  }

  // -------------------------------------------------------
  // LAST 7 DAYS
  // -------------------------------------------------------

  if (period === "7days") {
    const start = new Date(todayStart);

    start.setUTCDate(
      start.getUTCDate() - 6
    );

    return {
      start,
      end: todayEnd,
    };
  }

  // -------------------------------------------------------
  // LAST 30 DAYS
  // -------------------------------------------------------

  if (period === "30days") {
    const start = new Date(todayStart);

    start.setUTCDate(
      start.getUTCDate() - 29
    );

    return {
      start,
      end: todayEnd,
    };
  }

  // -------------------------------------------------------
  // THIS MONTH
  // -------------------------------------------------------

  if (period === "month") {
    const start = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        1,
        0,
        0,
        0,
        0
      )
    );

    return {
      start,
      end: todayEnd,
    };
  }

  // -------------------------------------------------------
  // ALL
  // -------------------------------------------------------

  return null;
}

// =========================================================
// FILTER CONVERSATIONS BY DATE
// =========================================================

async function getFilteredConversations(period) {
  const range = getDateRange(period);

  // No period = all conversations
  if (!range) {
    return await Conversation.find()
      .sort({ updatedAt: -1 })
      .lean();
  }

  return await Conversation.find({
    createdAt: {
      $gte: range.start,
      $lte: range.end,
    },
  })
    .sort({ updatedAt: -1 })
    .lean();
}


// =========================================================
// GET REPORT SUMMARY
// =========================================================

router.get("/summary", async (req, res) => {
  try {
    const { period } = req.query;

    const conversations =
      await getFilteredConversations(period);

    // -----------------------------------------------------
    // CONVERSATION COUNTS
    // -----------------------------------------------------

    const totalConversations =
      conversations.length;

    const aiHandled =
      conversations.filter(
        (conversation) =>
          conversation.handledBy === "AI"
      ).length;

    const humanHandled =
      conversations.filter(
        (conversation) =>
          conversation.handledBy === "Human"
      ).length;

    const completed =
      conversations.filter(
        (conversation) =>
          conversation.status === "Completed"
      ).length;

    const inProgress =
      conversations.filter(
        (conversation) =>
          conversation.status === "In Progress"
      ).length;

    const blocked =
      conversations.filter(
        (conversation) =>
          conversation.status === "Blocked"
      ).length;

    // -----------------------------------------------------
    // MESSAGE COUNTS
    // -----------------------------------------------------

    let totalMessages = 0;
    let employeeMessages = 0;
    let aiMessages = 0;
    let agentMessages = 0;

    conversations.forEach((conversation) => {
      const messages =
        conversation.messages || [];

      totalMessages += messages.length;

      messages.forEach((message) => {
        if (message.sender === "employee") {
          employeeMessages++;
        }

        if (message.sender === "ai") {
          aiMessages++;
        }

        if (message.sender === "agent") {
          agentMessages++;
        }
      });
    });

    // -----------------------------------------------------
    // RESPONSE
    // -----------------------------------------------------

    res.status(200).json({
      success: true,

      period: period || "all",

      data: {
        conversations: {
          total: totalConversations,
          aiHandled,
          humanHandled,
          completed,
          inProgress,
          blocked,
        },

        messages: {
          total: totalMessages,
          employee: employeeMessages,
          ai: aiMessages,
          agent: agentMessages,
        },
      },
    });
  } catch (error) {
    console.error(
      "Reports Summary Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// =========================================================
// GET CONVERSATION ANALYTICS
// =========================================================

router.get("/conversations", async (req, res) => {
  try {
    const { period } = req.query;

    const conversations =
      await getFilteredConversations(period);

    // -----------------------------------------------------
    // STATUS
    // -----------------------------------------------------

    const status = {
      completed: 0,
      inProgress: 0,
      blocked: 0,
    };

    // -----------------------------------------------------
    // HANDLER
    // -----------------------------------------------------

    const handledBy = {
      ai: 0,
      human: 0,
    };

    // -----------------------------------------------------
    // INTENTS
    // -----------------------------------------------------

    const intents = {};

    conversations.forEach((conversation) => {

      // STATUS

      if (
        conversation.status === "Completed"
      ) {
        status.completed++;
      }

      if (
        conversation.status === "In Progress"
      ) {
        status.inProgress++;
      }

      if (
        conversation.status === "Blocked"
      ) {
        status.blocked++;
      }

      // HANDLER

      if (
        conversation.handledBy === "AI"
      ) {
        handledBy.ai++;
      }

      if (
        conversation.handledBy === "Human"
      ) {
        handledBy.human++;
      }

      // INTENT

      const intent =
        conversation.intent ||
        "General Query";

      if (!intents[intent]) {
        intents[intent] = 0;
      }

      intents[intent]++;
    });

    // -----------------------------------------------------
    // RESPONSE
    // -----------------------------------------------------

    res.status(200).json({
      success: true,

      period: period || "all",

      data: {
        status,
        handledBy,
        intents,
      },
    });
  } catch (error) {
    console.error(
      "Conversation Analytics Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// =========================================================
// GET MESSAGE ANALYTICS
// =========================================================

router.get("/messages", async (req, res) => {
  try {
    const { period } = req.query;

    const conversations =
      await getFilteredConversations(period);

    const messages = {
      total: 0,
      employee: 0,
      ai: 0,
      agent: 0,
    };

    conversations.forEach((conversation) => {

      const conversationMessages =
        conversation.messages || [];

      conversationMessages.forEach((message) => {

        messages.total++;

        if (
          message.sender === "employee"
        ) {
          messages.employee++;
        }

        if (
          message.sender === "ai"
        ) {
          messages.ai++;
        }

        if (
          message.sender === "agent"
        ) {
          messages.agent++;
        }
      });
    });

    // -----------------------------------------------------
    // RESPONSE
    // -----------------------------------------------------

    res.status(200).json({
      success: true,

      period: period || "all",

      data: messages,
    });
  } catch (error) {
    console.error(
      "Message Analytics Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// =========================================================
// GET REPORT TRENDS
// =========================================================
//
// Returns day-wise:
//
// Conversations
// Customer messages
// AI messages
// Agent messages
//
// Example:
//
// GET /api/reports/trends?period=7days
//
// =========================================================

router.get("/trends", async (req, res) => {
  try {
    const period =
      req.query.period || "7days";

    const conversations =
      await getFilteredConversations(period);

    // -----------------------------------------------------
    // DETERMINE NUMBER OF DAYS
    // -----------------------------------------------------

    let numberOfDays = 7;

    if (period === "today") {
      numberOfDays = 1;
    }

    if (period === "yesterday") {
      numberOfDays = 1;
    }

    if (period === "30days") {
      numberOfDays = 30;
    }

    // -----------------------------------------------------
    // CREATE DAY MAP
    // -----------------------------------------------------

    const trendMap = {};

    const now = new Date();

    for (
      let i = numberOfDays - 1;
      i >= 0;
      i--
    ) {
      const date = new Date(now);

      date.setDate(
        date.getDate() - i
      );

      date.setHours(0, 0, 0, 0);

      const key =
        date.toISOString().split("T")[0];

      trendMap[key] = {
        date: key,
        conversations: 0,
        messages: 0,
        employee: 0,
        ai: 0,
        agent: 0,
      };
    }

    // -----------------------------------------------------
    // ADD CONVERSATIONS
    // -----------------------------------------------------

    conversations.forEach(
      (conversation) => {

        const createdAt =
          new Date(
            conversation.createdAt
          );

        const dateKey =
          createdAt
            .toISOString()
            .split("T")[0];

        if (trendMap[dateKey]) {

          trendMap[
            dateKey
          ].conversations++;

        }

        // -------------------------------------------------
        // ADD MESSAGES
        // -------------------------------------------------

        const conversationMessages =
          conversation.messages || [];

        conversationMessages.forEach(
          (message) => {

            const messageDate =
              new Date(
                message.timestamp ||
                conversation.createdAt
              );

            const messageKey =
              messageDate
                .toISOString()
                .split("T")[0];

            if (
              !trendMap[messageKey]
            ) {
              return;
            }

            trendMap[
              messageKey
            ].messages++;

            if (
              message.sender ===
              "employee"
            ) {
              trendMap[
                messageKey
              ].employee++;
            }

            if (
              message.sender ===
              "ai"
            ) {
              trendMap[
                messageKey
              ].ai++;
            }

            if (
              message.sender ===
              "agent"
            ) {
              trendMap[
                messageKey
              ].agent++;
            }
          }
        );
      }
    );

    // -----------------------------------------------------
    // RESPONSE
    // -----------------------------------------------------

    const trends =
      Object.values(trendMap);

    res.status(200).json({
      success: true,

      period,

      data: trends,
    });

  } catch (error) {

    console.error(
      "Reports Trends Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
router.get("/debug-dates", async (req, res) => {
  try {
    const conversations = await Conversation.find()
      .select("contactName createdAt updatedAt messages")
      .lean();

    res.json({
      success: true,
      data: conversations.map((conversation) => ({
        contactName: conversation.contactName,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        messageDates: (conversation.messages || []).map(
          (message) => message.timestamp
        ),
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// =========================================================
// EXPORT
// =========================================================

module.exports = router;