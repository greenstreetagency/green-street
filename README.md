# Green Street
Green Street Agency Website

### Development
To get started, run ``gulp`` to launch a development server and watcher task.  

##### Pushing Commits
After commiting to master, run
```
git subtree push --prefix public/dist/ origin production
```
to push code in the ``public/dist/`` directory to the production branch.  

Once I figure out how to use git hooks to automate this process, we won't need to do this anymore

### Deployment

```
ssh -i ~/.ssh/streetvirus.pem ec2-user@52.10.10.149
cd  /var/www/sites/greenstreetagency.com
git branch // Make sure you're on 'production'
git pull
```
