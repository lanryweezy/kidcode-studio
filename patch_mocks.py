import re

with open('src/hooks/handlers/__tests__/mocks.ts', 'r') as f:
    content = f.read()

# Fix speechType default value to be 'say' instead of null or undefined
content = re.sub(
    r"speech: null,",
    r"speech: null,\n  speechType: 'say',",
    content
)

with open('src/hooks/handlers/__tests__/mocks.ts', 'w') as f:
    f.write(content)
