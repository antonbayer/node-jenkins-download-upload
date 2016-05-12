# node-jenkins-download-upload

create the directories jobs-download and jobs-upload

do: npm install

npm run jenkins-download to download all config xml to jobs-download
npm run jenkins-upload to upload all config xml from jobs-upload

feature added:
use npm run jenkins-upload --git_group=my-group --git_repo=my-repo to replace #GIT_GROUP and #GIT_REPO# in the filenames and the content of the jobs that get uploaded.
