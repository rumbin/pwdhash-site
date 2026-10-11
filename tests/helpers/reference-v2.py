import hmac, hashlib
import sys

# PwdHash v2 reference implementation (independent of the JS code).
# Spec:
#   - the password is used LITERALLY ('@@' stripping is the form layer's job)
#   - L = max(12, 2n + 2) where n = length of the password in UTF-16 code units
#     (JS string semantics; len(pw.encode('utf-16-le')) // 2 in Python)
#   - stream = HMAC-MD5(key=password.encode('utf-8'),
#                        data="PwdHash-2|{realm}|{i}".encode('utf-8')) for i = 0,1,2,...
#   - rejection-sample chars: accept byte b iff b < (256 // len(set)) * len(set)
#   - force positions 0..3 to one lower/upper/digit/special, then Fisher-Yates
#     shuffle over all L positions with unbiased indices from the same stream
#
# Non-ASCII: key and message are UTF-8. For lone surrogates (impossible in
# normal DOM input) the JS uses WTF-8 (3-byte form); match with
# pw.encode('utf-8', 'surrogatepass').

ALPHABET_L = "abcdefghijklmnopqrstuvwxyz"
ALPHABET_U = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
ALPHABET_D = "0123456789"
ALPHABET_S = "!@#$%^&*()-_=+[]{}:;,.?/"
ALPHABET = ALPHABET_L + ALPHABET_U + ALPHABET_D + ALPHABET_S


def utf16_len(s):
    return len(s.encode("utf-16-le")) // 2


def stream(password, realm, n_blocks):
    key = password.encode("utf-8", "surrogatepass")
    return b"".join(
        hmac.new(key, f"PwdHash-2|{realm}|{i}".encode("utf-8", "surrogatepass"), hashlib.md5).digest()
        for i in range(n_blocks)
    )


class R:
    def __init__(self, data):
        self.data, self.pos = data, 0

    def byte(self):
        b = self.data[self.pos]
        self.pos += 1
        return b

    def draw(self, alphabet):
        limit = (256 // len(alphabet)) * len(alphabet)
        while True:
            b = self.byte()
            if b < limit:
                return alphabet[b % len(alphabet)]

    def index(self, n):
        limit = (256 // n) * n
        while True:
            b = self.byte()
            if b < limit:
                return b % n


def v2(password, realm):
    n = utf16_len(password)
    L = max(12, 2 * n + 2)
    r = R(stream(password, realm, L + 16))
    chars = [r.draw(ALPHABET) for _ in range(L)]
    chars[0] = r.draw(ALPHABET_L)
    chars[1] = r.draw(ALPHABET_U)
    chars[2] = r.draw(ALPHABET_D)
    chars[3] = r.draw(ALPHABET_S)
    for i in range(L - 1, 0, -1):
        j = r.index(i + 1)
        chars[i], chars[j] = chars[j], chars[i]
    return "".join(chars)


if __name__ == "__main__":
    pw, realm = sys.argv[1], sys.argv[2]
    print(v2(pw, realm))
