const required = [
  {
    name: 'VITE_JIEYOU_WISH_SYNC_PUBLIC_ENDPOINT',
    validate: (value) => /^https:\/\/.+\/wish\/submit$/i.test(value),
    hint: 'Value must look like https://xxx.trycloudflare.com/wish/submit',
  },
  {
    name: 'VITE_JIEYOU_WISH_SYNC_TOKEN',
    validate: (value) => value.length > 0,
    hint: 'Value must match the local gateway token.',
  },
  {
    name: 'VITE_TCB_ENV_ID',
    validate: (value) => value.length > 0,
    hint: 'Value should be your CloudBase env id.',
  },
];

const missingOrInvalid = required.filter(({ name, validate }) => {
  const value = process.env[name]?.trim() ?? '';
  return !value || !validate(value);
});

if (missingOrInvalid.length > 0) {
  console.error('GitHub Pages build is missing required wish sync variables.');
  console.error('Add them in: Settings -> Secrets and variables -> Actions -> Variables -> Repository variables');
  for (const item of missingOrInvalid) {
    console.error(`- ${item.name}: ${item.hint}`);
  }
  process.exit(1);
}

console.log('Wish sync GitHub Pages variables are configured.');
