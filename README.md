
# Assignment Code

This is the template code that you will need to use as a starting point for your coursework.

You should make sure you are accessing Codio using a standards-compliant web browser such as **Google Chrome** or **Chromium**.

## Running Your Server

All the core packages have already been installed so all you need to do to get your server running is to open the **terminal** from the **Tools** menu (if it is not already open) and run the following command:

```shell
$ node index.js
```

This will start your web server. To view your website click on the dropdown list labelled **Live Site** at the top of the Codio window and choose the **New browser tab** option. This will open your website in a new tab.

To make life easier you can split your editor window both horizontally and/or vertically so you can see both the code and the terminal. Use the **View > Panels** and **View > Layout** menus.

## Setting up a Git Repository

As part of the assignment you are expected to make regular commits to your git repository. Follow this step by step guide:

### Local Config Settings

Before you make any commits you need to update the [local config settings](https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup). Start by using the Terminal (or Git Bash on Windows) navigate inside the project. Once you are in this directory run the following commands, substituting you name as it appears on your ID badge and your university email address (without the `uni.` domain prefix).

```bash
git config user.name 'John Doe'
git config user.email 'doej@coventry.ac.uk'
```

### Create a New Remote Repository

1. Log onto the [University GitHub server](https://github.coventry.ac.uk) using your University username and password.
2. Your assignment brief will give you the _organisation url_, this will take you to the module page on GitHub.
3. Create a new repository using the green **New** button:
    1. The name of the repository should be your university username, eg. `doej` and should include the suffix of either `-sem1`, `-sem2` or `-sem3` depending on which semester you are taking the assignment in, eg. `doej-sem1`.
    2. The description should be the topic you were assigned (eg. **Customer Relationship Manager**).
    3. The repository should be **private**.
4. Now follow the instructions git provides under the heading **create a new repository on the command line**.
    1. Don't run the first `echo` command as this will delete these instructions!

## Working With SQLite

The SQLite3 commandline tool is already installed and should be used to configure your database.
