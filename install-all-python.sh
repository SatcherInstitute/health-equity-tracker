# because why not
pip install wheel

for file in $(find . -name "requirements.txt")
do
    echo "File: $file"
    pip install -r ${file}
done

for dir in $(find . -type d -not -path "./.venv/*" -not -path "./.git/*")
do
    if test -f $dir/setup.py ; then
        pip install $dir
    fi
done