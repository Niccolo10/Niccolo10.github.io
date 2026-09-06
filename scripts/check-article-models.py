"""Exercise the locally authored Python teaching models, without network or targets."""
from pathlib import Path
import re

root = Path(__file__).resolve().parents[1] / 'src/content/bug-code'

def load_models(slug):
    text = (root / f'{slug}.md').read_text()
    blocks = re.findall(r'```python\n(.*?)\n```', text, re.S)
    assert len(blocks) == 2, f'Expected before/after models: {slug}'
    namespace = {}
    for block in blocks:
        exec(compile(block, f'{slug}.md', 'exec'), namespace)
    return namespace

def denied(fn):
    try:
        fn()
    except PermissionError:
        return
    raise AssertionError('Expected permission denial')

invite_models = load_models('invitation-is-not-identity')
invite = dict(status='pending', recipient='alex@example.invalid', organization='workspace-1', role='administrator')
wrong = dict(id='sam-account', verified_emails=['sam@example.invalid'])
right = dict(id='alex-account', verified_emails=['alex@example.invalid'])
assert invite_models['accept_vulnerable'](invite, wrong['id'])['role'] == 'administrator'
denied(lambda: invite_models['accept_with_recipient_check'](invite, wrong))
denied(lambda: invite_models['accept_with_recipient_check'](invite, dict(id='unverified', verified_emails=[])))
assert invite_models['accept_with_recipient_check'](invite, right)['user_id'] == right['id']

class Storage:
    def __init__(self):
        self.calls = []
    def download(self, container, object_path):
        self.calls.append((container, object_path))
        return b'test document'

cloud = load_models('service-identity-is-not-permission')
storage = Storage()
documents = {'doc-1': dict(organization='workspace-1', container='private', object_path='example.pdf')}
parse = lambda content: len(content)
assert cloud['process_vulnerable'](dict(container='arbitrary', object_path='selected.pdf'), storage, parse) > 0
assert storage.calls == [('arbitrary', 'selected.pdf')]
storage.calls.clear()
for user, doc in [(None, 'doc-1'), (dict(organization='workspace-2'), 'doc-1'), (dict(organization='workspace-1'), 'missing')]:
    denied(lambda: cloud['process_authorized'](user, doc, documents, storage, parse))
assert storage.calls == [], 'Rejected requests must not reach storage'
assert cloud['process_authorized'](dict(organization='workspace-1'), 'doc-1', documents, storage, parse) > 0
assert storage.calls == [('private', 'example.pdf')]
identity = load_models('a-token-is-not-an-account')
assert identity['resolve_account'](identity['known'], identity['bindings']) == 'account-a'
denied(lambda: identity['resolve_account']({**identity['known'], 'subject': 'unknown'}, identity['bindings']))
print('Six article code blocks verified: recipient binding, authorization before storage, and issuer/subject account binding. No external requests.')
