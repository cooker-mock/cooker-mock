# Cooker
The best front-end local mocking tool ever!

# Project Overview

- [cooker-mock (current)](https://github.com/cooker-mock/cooker-mock)
- [cooker-proxy](https://github.com/cooker-mock/cooker-proxy)
- [cooker-example](https://github.com/cooker-mock/cooker-example)

![architecture0.3.0](docs/assets/architecture0.3.0.png)

# Contribution Guide

**For Organization Members Only**

## Overall Process

1. **Clone the Repository**: Clone the repository to your local machine.
    ```sh
   git clone git@github.com:cooker-mock/cooker-mock.git
    ```
2. **Create a Branch**: The branch name should follow this format
    ```sh
    git checkout -b feat/your-feature
    ```
    How to name your branch:

    | Purpose  | Branch Name Example |
    | :------- | :-----------------: |
    | developing a new feature | feat/multi-scenario-mock |
    | fixing a bug             | fix/bug-description |
    | improving documentation  | docs/update-readme |
    | refactoring code         | refactor/code-structure |
    | adding tests             | test/add-new-tests |
    | performing a release     | release/v1.0.0 |

3. **Make Changes**: Make your changes to the code. (For detailed code development guidelines, please refer to the following section.)

4. **Commit Changes**: Commit your changes with a clear message.
    - Keep the commit history clean and organized.
    - Do not combine multiple unrelated changes in a single commit.
    - Each commit should follow the single responsibility principle and be atomic.
    - Follow the commit message convention:
        - `feat: description` for new features
        - `fix: description` for bug fixes
        - `docs: description` for documentation improvements
        - `refactor: description` for code refactoring
        - `test: description` for adding or updating tests
        - `chore: description` for maintenance tasks

    e.g.,
    ```sh
    git add App.jsx App.css
    git commit -m "feat: add form component to web-ui for creating multi-scenario api mock"
    ```


5. **Push Changes**: Push your changes to the repository.
    ```sh
    git push origin feat/your-feature
    ```

6. **Create a Pull Request**: Go to the repository and create a pull request from your branch.

7. **Review**: Wait for the project maintainers to review your pull request. Make any requested changes.

8. **Merge**: Once approved, your changes will be merged into the main repository.

Thank you for contributing!


## Code Development Guidelines

### 1. Install Node.js

download and install the latest LTS version of Node.js. For this moment, it is V22.

1. go to https://nodejs.org/en/download/current
2. find this on the bottom of the page: "Or get a prebuilt Node.js® for [macOS/windows] running a [x64/ARM64]"
3. download installer, and install it
4. check installation
    ```sh
    node -v # Should print "v22.13.1".
    ```

### 2. Install Yarn


```sh
npm install --global yarn
```

Check that Yarn is installed by running:

```sh
yarn --version
```


[What is Yarn?](https://classic.yarnpkg.com/en/docs/getting-started)


### 3. Install Project's Dependencies

Navigate to the project directory and install the dependencies using Yarn:

```sh
cd cooker-mock
yarn install
```

### 4. Run the Project for Development

```sh
yarn dev:both
```

This will start the project. There are 2 local servers running at the same time.

- The main server is running at port 8088
- The web-ui React local development server is running at port 9088

You can access the web-ui at http://localhost:9088 for both front-end and back-end development, because calling APIs from the web-ui will be proxied to the main server (proxy configuration is in the `vite.config.js`).

The RESTful-APIs is accessible at http://localhost:8088

### 5. Project Directory Structure

Below is an explanation of the project's directory structure:
```
.
├── LICENSE                     # License file for the project
├── README.md                   # Project's main README file
├── constants.js                # File containing constant values used across the project
├── index.js                    # Entry point for the Node.js server
├── io
│   └── dataHandler.js          # Module for handling mock data operations, data-layer
├── package.json                # Project's package configuration file
├── public
│   └── cooker-proxy.js         # Publicly JavaScript file for proxying apis, will be injected to user's page by our Chrome Ext
├── routes
│   └── api.js                  # Express router for handling API routes
├── web-ui
│   ├── README.md               # README file for the web-ui part of the project
│   ├── eslint.config.js        # ESLint configuration file for the web-ui
│   ├── index.html              # Main HTML file for the web-ui
│   ├── package.json            # Package configuration file for the web-ui
│   ├── public
│   │   └── logo.png            # Public assets for the web-ui
│   ├── src
│   │   ├── App.css             # CSS file for the main App component
│   │   ├── App.jsx             # Main App component for the web-ui
│   │   ├── assets              # Directory for static assets
│   │   ├── components          # Directory for React components
│   │   ├── index.css           # Global CSS file
│   │   ├── main.jsx            # Entry point for the React application
│   │   └── pages
│   │       └── MockApiManager
│   │           └── index.jsx   # Component for managing mock APIs
│   ├── vite.config.js          # Vite building configuration file for the web-ui
│   └── yarn.lock               # Lock file for Yarn dependencies
└── yarn.lock                   # Lock file for Yarn dependencies
```


### 6. Running Tests

To run the tests for the project, use the following command:

```sh
yarn test
```

This will execute all the test cases and provide you with a summary of the test results.

### 7. Building the Project

To create a production build of the project, use the following command:

```sh
yarn build
```

We only build the web-ui code, and the output is located in the `public/web-ui-dist` directory. The Node.js code does not require building for now.

### 8. Linting and Formatting

To ensure code quality and consistency, run the linter and formatter before committing your changes:

```sh
yarn lint
yarn format
```

This will check for any linting errors and format the code according to the project's style guidelines.

### 9. Debugging

For debugging purposes, you can use Visual Studio Code. You can find debug configuration file in `.vscode/launch.json`.

This will allow you to start the project in debug mode. You can set breakpoints and inspect the code during execution by using the built-in debugging tools in Visual Studio Code.

**Start Debugging**

1. Open the debug panel in VS Code (the bug icon on the left sidebar)
2. Select the `Debug Cooker Mock` configuration
3. Click the green play button to start debugging


### 10. Additional Resources

For more information on how to use the tools and libraries in this project, refer to the following resources:

- [Learn JavaScript](https://javascript.info/)
- [Node.js Documentation](https://nodejs.org/en/docs/)
- [Express.js Documentation](https://expressjs.com/en/starter/installing.html)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Vite Documentation](https://vitejs.dev/guide/)

Feel free to reach out to the project maintainers if you have any questions or need further assistance.
