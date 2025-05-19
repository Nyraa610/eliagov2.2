
module.exports = {
  transform: {
    '^.+\\.(ts|tsx)$': 'babel-jest',
  },
  testEnvironment: 'jsdom',
  moduleNameMapper: {
      "\\.(css|less|scss|sass)$": "identity-obj-proxy",
      "^@/(.*)$": "<rootDir>/src/$1",
  } 
};