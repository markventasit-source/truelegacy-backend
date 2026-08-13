module.exports = {
  ROLES: {
    ADMIN: "admin",
    USER: "user",
    GUEST: "guest",
    MEMBER: "member",
  },
  GENDER: {
    MALE: "male",
    FEMALE: "female",
  },
  RELIGION: {
    HINDU: "hindu",
    MUSLIM: "muslim",
    CHRISTIAN: "christian",
  },
  RELIGION_CONFIG: {
    hindu: {
      name: "Hindu",
      inheritance_law: "Hindu Succession Act, 1956",
      supported: true,
    },
    muslim: {
      name: "Muslim",
      inheritance_law: "Muslim Personal Law (Sharia)",
      supported: true,
    },
    christian: {
      name: "Christian",
      inheritance_law: "Indian Succession Act, 1925",
      supported: true,
    },
  },
};