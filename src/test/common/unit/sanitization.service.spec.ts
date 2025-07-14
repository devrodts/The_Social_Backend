import { Test, TestingModule } from '@nestjs/testing';
import { SanitizationService } from '../../../modules/common/services/sanitization.service';

describe('SanitizationService', () => {
  let service: SanitizationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SanitizationService],
    }).compile();

    service = module.get<SanitizationService>(SanitizationService);
  });

  describe('sanitizeText', () => {
    it('should return empty string for null input', () => {
      expect(service.sanitizeText(null as any)).toBe('');
    });

    it('should return empty string for undefined input', () => {
      expect(service.sanitizeText(undefined as any)).toBe('');
    });

    it('should return empty string for non-string input', () => {
      expect(service.sanitizeText(123 as any)).toBe('');
      expect(service.sanitizeText({} as any)).toBe('');
      expect(service.sanitizeText([] as any)).toBe('');
    });

    it('should return empty string for empty string', () => {
      expect(service.sanitizeText('')).toBe('');
    });

    it('should return empty string for whitespace only', () => {
      expect(service.sanitizeText('   \n\t  ')).toBe('');
    });

    it('should preserve normal text without dangerous content', () => {
      const input = 'Hello, this is a normal text message!';
      expect(service.sanitizeText(input)).toBe('Hello, this is a normal text message!');
    });

    describe('XSS Prevention', () => {
      it('should remove script tags completely', () => {
        const input = '<script>alert("XSS")</script>Hello World';
        expect(service.sanitizeText(input)).toBe('Hello World');
      });

      it('should remove script tags with attributes', () => {
        const input = '<script src="malicious.js" onload="alert(1)">alert("XSS")</script>Hello';
        expect(service.sanitizeText(input)).toBe('Hello');
      });

      it('should remove iframe tags', () => {
        const input = '<iframe src="malicious.com"></iframe>Content';
        expect(service.sanitizeText(input)).toBe('Content');
      });

      it('should remove object tags', () => {
        const input = '<object data="malicious.swf"></object>Content';
        expect(service.sanitizeText(input)).toBe('Content');
      });

      it('should remove embed tags', () => {
        const input = '<embed src="malicious.swf">Content';
        expect(service.sanitizeText(input)).toBe('Content');
      });

      it('should remove form tags', () => {
        const input = '<form action="malicious.com" method="post">Content</form>';
        expect(service.sanitizeText(input)).toBe('Content');
      });

      it('should remove input tags', () => {
        const input = '<input type="text" onchange="alert(1)">Content';
        expect(service.sanitizeText(input)).toBe('Content');
      });

      it('should remove textarea tags', () => {
        const input = '<textarea onfocus="alert(1)">Content</textarea>';
        expect(service.sanitizeText(input)).toBe('Content');
      });

      it('should remove select tags', () => {
        const input = '<select onchange="alert(1)">Content</select>';
        expect(service.sanitizeText(input)).toBe('Content');
      });

      it('should remove button tags', () => {
        const input = '<button onclick="alert(1)">Click me</button>Content';
        expect(service.sanitizeText(input)).toBe('Content');
      });

      it('should remove link tags', () => {
        const input = '<link rel="stylesheet" href="malicious.css">Content';
        expect(service.sanitizeText(input)).toBe('Content');
      });

      it('should remove meta tags', () => {
        const input = '<meta http-equiv="refresh" content="0;url=malicious.com">Content';
        expect(service.sanitizeText(input)).toBe('Content');
      });

      it('should remove style tags', () => {
        const input = '<style>body{background:url(javascript:alert(1))}</style>Content';
        expect(service.sanitizeText(input)).toBe('Content');
      });

      it('should remove base tags', () => {
        const input = '<base href="malicious.com">Content';
        expect(service.sanitizeText(input)).toBe('Content');
      });

      it('should remove title tags', () => {
        const input = '<title>Malicious Title</title>Content';
        expect(service.sanitizeText(input)).toBe('Content');
      });

      it('should remove head tags', () => {
        const input = '<head><script>alert(1)</script></head>Content';
        expect(service.sanitizeText(input)).toBe('Content');
      });

      it('should remove body tags', () => {
        const input = '<body onload="alert(1)">Content</body>';
        expect(service.sanitizeText(input)).toBe('Content');
      });

      it('should remove html tags', () => {
        const input = '<html><script>alert(1)</script></html>Content';
        expect(service.sanitizeText(input)).toBe('Content');
      });

      it('should remove any remaining HTML tags', () => {
        const input = '<div><span><p>Content</p></span></div>';
        expect(service.sanitizeText(input)).toBe('Content');
      });

      it('should encode HTML entities', () => {
        const input = 'Hello <world> & "quotes" \'single\' /slash';
        expect(service.sanitizeText(input)).toBe('Hello &lt;world&gt; &amp; &quot;quotes&quot; &#x27;single&#x27; &#x2F;slash');
      });

      it('should remove javascript: protocol', () => {
        const input = 'javascript:alert("XSS")';
        expect(service.sanitizeText(input)).toBe('alert(&quot;XSS&quot;)');
      });

      it('should remove vbscript: protocol', () => {
        const input = 'vbscript:msgbox("XSS")';
        expect(service.sanitizeText(input)).toBe('msgbox(&quot;XSS&quot;)');
      });

      it('should remove data: protocol', () => {
        const input = 'data:text/html,<script>alert(1)</script>';
        expect(service.sanitizeText(input)).toBe('text/html,');
      });

      it('should remove event handlers', () => {
        const input = 'onclick="alert(1)" onload="alert(2)" onmouseover="alert(3)"';
        expect(service.sanitizeText(input)).toBe('&quot;alert(1)&quot; &quot;alert(2)&quot; &quot;alert(3)&quot;');
      });

      it('should remove CSS expressions', () => {
        const input = 'expression(alert("XSS"))';
        expect(service.sanitizeText(input)).toBe('(alert(&quot;XSS&quot;))');
      });

      it('should remove javascript URLs in CSS', () => {
        const input = 'url(javascript:alert("XSS"))';
        expect(service.sanitizeText(input)).toBe('url(alert(&quot;XSS&quot;))');
      });

      it('should remove eval() calls', () => {
        const input = 'eval("alert(1)")';
        expect(service.sanitizeText(input)).toBe('(&quot;alert(1)&quot;)');
      });

      it('should remove setTimeout calls', () => {
        const input = 'setTimeout("alert(1)", 1000)';
        expect(service.sanitizeText(input)).toBe('(&quot;alert(1)&quot;, 1000)');
      });

      it('should remove setInterval calls', () => {
        const input = 'setInterval("alert(1)", 1000)';
        expect(service.sanitizeText(input)).toBe('(&quot;alert(1)&quot;, 1000)');
      });
    });

    describe('SQL Injection Prevention', () => {
      it('should remove UNION SELECT', () => {
        const input = 'UNION SELECT * FROM users';
        expect(service.sanitizeText(input)).toBe('* FROM users');
      });

      it('should remove DROP TABLE', () => {
        const input = 'DROP TABLE users';
        expect(service.sanitizeText(input)).toBe('users');
      });

      it('should remove DELETE FROM', () => {
        const input = 'DELETE FROM users WHERE id = 1';
        expect(service.sanitizeText(input)).toBe('users WHERE id = 1');
      });

      it('should remove INSERT INTO', () => {
        const input = 'INSERT INTO users (name) VALUES ("admin")';
        expect(service.sanitizeText(input)).toBe('users (name) VALUES (&quot;admin&quot;)');
      });

      it('should remove UPDATE SET', () => {
        const input = 'UPDATE users SET password = "hacked"';
        expect(service.sanitizeText(input)).toBe('users password = &quot;hacked&quot;');
      });

      it('should remove ALTER TABLE', () => {
        const input = 'ALTER TABLE users ADD COLUMN hacked';
        expect(service.sanitizeText(input)).toBe('users ADD COLUMN hacked');
      });

      it('should remove CREATE TABLE', () => {
        const input = 'CREATE TABLE malicious (id int)';
        expect(service.sanitizeText(input)).toBe('malicious (id int)');
      });

      it('should remove EXEC calls', () => {
        const input = 'EXEC xp_cmdshell "dir"';
        expect(service.sanitizeText(input)).toBe('xp_cmdshell &quot;dir&quot;');
      });

      it('should remove EXECUTE calls', () => {
        const input = 'EXECUTE sp_executesql "SELECT * FROM users"';
        expect(service.sanitizeText(input)).toBe('sp_executesql &quot;SELECT * FROM users&quot;');
      });
    });

    describe('NoSQL Injection Prevention', () => {
      it('should remove MongoDB $where', () => {
        const input = 'db.users.find({$where: "this.password == \'admin\'"})';
        expect(service.sanitizeText(input)).toBe('db.users.find({: &quot;this.password == &#x27;admin&#x27;&quot;})');
      });

      it('should remove MongoDB $ne', () => {
        const input = 'db.users.find({status: {$ne: "active"}})';
        expect(service.sanitizeText(input)).toBe('db.users.find({status: {: &quot;active&quot;}})');
      });

      it('should remove MongoDB $gt', () => {
        const input = 'db.users.find({age: {$gt: 18}})';
        expect(service.sanitizeText(input)).toBe('db.users.find({age: {: 18}})');
      });

      it('should remove MongoDB $lt', () => {
        const input = 'db.users.find({age: {$lt: 65}})';
        expect(service.sanitizeText(input)).toBe('db.users.find({age: {: 65}})');
      });

      it('should remove MongoDB $regex', () => {
        const input = 'db.users.find({name: {$regex: "admin"}})';
        expect(service.sanitizeText(input)).toBe('db.users.find({name: {: &quot;admin&quot;}})');
      });

      it('should remove MongoDB $in', () => {
        const input = 'db.users.find({role: {$in: ["admin", "user"]}})';
        expect(service.sanitizeText(input)).toBe('db.users.find({role: {: [&quot;admin&quot;, &quot;user&quot;]}})');
      });

      it('should remove MongoDB $nin', () => {
        const input = 'db.users.find({role: {$nin: ["admin"]}})';
        expect(service.sanitizeText(input)).toBe('db.users.find({role: {: [&quot;admin&quot;]}})');
      });
    });

    describe('Command Injection Prevention', () => {
      it('should remove trailing semicolons', () => {
        const input = 'ls -la; rm -rf /';
        expect(service.sanitizeText(input)).toBe('ls -la rm -rf /');
      });

      it('should remove trailing pipes', () => {
        const input = 'cat file.txt | grep password';
        expect(service.sanitizeText(input)).toBe('cat file.txt grep password');
      });

      it('should remove trailing ampersands', () => {
        const input = 'start service & echo "done"';
        expect(service.sanitizeText(input)).toBe('start service echo &quot;done&quot;');
      });

      it('should remove backticks', () => {
        const input = 'echo `whoami`';
        expect(service.sanitizeText(input)).toBe('echo whoami');
      });

      it('should remove command substitution', () => {
        const input = 'echo $(whoami)';
        expect(service.sanitizeText(input)).toBe('echo (whoami)');
      });

      it('should remove parameter expansion', () => {
        const input = 'echo ${USER}';
        expect(service.sanitizeText(input)).toBe('echo ');
      });
    });

    describe('Whitespace Normalization', () => {
      it('should normalize multiple spaces', () => {
        const input = 'Hello    World';
        expect(service.sanitizeText(input)).toBe('Hello World');
      });

      it('should normalize tabs and newlines', () => {
        const input = 'Hello\t\nWorld';
        expect(service.sanitizeText(input)).toBe('Hello World');
      });

      it('should trim leading and trailing whitespace', () => {
        const input = '   Hello World   ';
        expect(service.sanitizeText(input)).toBe('Hello World');
      });
    });
  });

  describe('sanitizeUsername', () => {
    it('should return empty string for null input', () => {
      expect(service.sanitizeUsername(null as any)).toBe('');
    });

    it('should return empty string for undefined input', () => {
      expect(service.sanitizeUsername(undefined as any)).toBe('');
    });

    it('should return empty string for non-string input', () => {
      expect(service.sanitizeUsername(123 as any)).toBe('');
    });

    it('should return empty string for empty string', () => {
      expect(service.sanitizeUsername('')).toBe('');
    });

    it('should remove HTML and script tags', () => {
      const input = '<script>alert(1)</script>john_doe';
      expect(service.sanitizeUsername(input)).toBe('john_doe');
    });

    it('should remove Windows forbidden characters', () => {
      const input = 'john<doe:user"name|file?*';
      expect(service.sanitizeUsername(input)).toBe('johndoeusernamefile');
    });

    it('should keep only alphanumeric, hyphens, underscores, and dots', () => {
      const input = 'john.doe-user_name123';
      expect(service.sanitizeUsername(input)).toBe('john.doe-user_name123');
    });

    it('should remove leading dots, underscores, hyphens', () => {
      const input = '...___---john_doe';
      expect(service.sanitizeUsername(input)).toBe('john_doe');
    });

    it('should remove trailing dots, underscores, hyphens', () => {
      const input = 'john_doe...___---';
      expect(service.sanitizeUsername(input)).toBe('john_doe');
    });

    it('should replace multiple consecutive dots with single dot', () => {
      const input = 'john...doe';
      expect(service.sanitizeUsername(input)).toBe('john.doe');
    });

    it('should replace multiple consecutive underscores with single underscore', () => {
      const input = 'john___doe';
      expect(service.sanitizeUsername(input)).toBe('john_doe');
    });

    it('should replace multiple consecutive hyphens with single hyphen', () => {
      const input = 'john---doe';
      expect(service.sanitizeUsername(input)).toBe('john-doe');
    });

    it('should limit length to 20 characters', () => {
      const input = 'very_long_username_that_exceeds_limit';
      expect(service.sanitizeUsername(input)).toBe('very_long_username_');
    });

    it('should convert to lowercase', () => {
      const input = 'JohnDoe';
      expect(service.sanitizeUsername(input)).toBe('johndoe');
    });

    it('should handle complex case with all sanitization rules', () => {
      const input = '...___---<script>alert(1)</script>John.Doe-User_Name123...___---';
      expect(service.sanitizeUsername(input)).toBe('john.doe-user_name123');
    });
  });

  describe('sanitizeDisplayName', () => {
    it('should return empty string for null input', () => {
      expect(service.sanitizeDisplayName(null as any)).toBe('');
    });

    it('should return empty string for undefined input', () => {
      expect(service.sanitizeDisplayName(undefined as any)).toBe('');
    });

    it('should return empty string for non-string input', () => {
      expect(service.sanitizeDisplayName(123 as any)).toBe('');
    });

    it('should return empty string for empty string', () => {
      expect(service.sanitizeDisplayName('')).toBe('');
    });

    it('should remove HTML and script tags', () => {
      const input = '<script>alert(1)</script>John Doe';
      expect(service.sanitizeDisplayName(input)).toBe('John Doe');
    });

    it('should remove dangerous characters', () => {
      const input = 'John<Doe:User"Name|File?*';
      expect(service.sanitizeDisplayName(input)).toBe('JohnDoeUserNameFile');
    });

    it('should keep alphanumeric, spaces, hyphens, dots, apostrophes, parentheses, punctuation', () => {
      const input = 'John Doe-Smith (Jr.) - "The Great"!';
      expect(service.sanitizeDisplayName(input)).toBe('John Doe-Smith (Jr.) - The Great!');
    });

    it('should normalize whitespace', () => {
      const input = 'John    Doe';
      expect(service.sanitizeDisplayName(input)).toBe('John Doe');
    });

    it('should trim leading and trailing whitespace', () => {
      const input = '   John Doe   ';
      expect(service.sanitizeDisplayName(input)).toBe('John Doe');
    });

    it('should limit length to 50 characters', () => {
      const input = 'Very Long Display Name That Exceeds The Maximum Length Limit';
      expect(service.sanitizeDisplayName(input)).toBe('Very Long Display Name That Exceeds The Maximum');
    });

    it('should handle complex case with all sanitization rules', () => {
      const input = '   <script>alert(1)</script>John<Doe:User"Name|File?*   ';
      expect(service.sanitizeDisplayName(input)).toBe('JohnDoeUserNameFile');
    });
  });

  describe('sanitizeEmail', () => {
    it('should return empty string for null input', () => {
      expect(service.sanitizeEmail(null as any)).toBe('');
    });

    it('should return empty string for undefined input', () => {
      expect(service.sanitizeEmail(undefined as any)).toBe('');
    });

    it('should return empty string for non-string input', () => {
      expect(service.sanitizeEmail(123 as any)).toBe('');
    });

    it('should return empty string for empty string', () => {
      expect(service.sanitizeEmail('')).toBe('');
    });

    it('should remove HTML and script tags', () => {
      const input = '<script>alert(1)</script>john@example.com';
      expect(service.sanitizeEmail(input)).toBe('john@example.com');
    });

    it('should remove dangerous characters', () => {
      const input = 'john<doe:user"name|file?*@example.com';
      expect(service.sanitizeEmail(input)).toBe('johndoeusernamefile@example.com');
    });

    it('should keep alphanumeric, @, hyphens, dots, underscores', () => {
      const input = 'john.doe-user_name@example-domain.com';
      expect(service.sanitizeEmail(input)).toBe('john.doe-user_name@example-domain.com');
    });

    it('should convert to lowercase', () => {
      const input = 'John.Doe@EXAMPLE.COM';
      expect(service.sanitizeEmail(input)).toBe('john.doe@example.com');
    });

    it('should trim whitespace', () => {
      const input = '   john@example.com   ';
      expect(service.sanitizeEmail(input)).toBe('john@example.com');
    });

    it('should handle complex case with all sanitization rules', () => {
      const input = '   <script>alert(1)</script>John<Doe:User"Name|File?*@EXAMPLE.COM   ';
      expect(service.sanitizeEmail(input)).toBe('johndoeusernamefile@example.com');
    });
  });

  describe('sanitizeTweetContent', () => {
    it('should return empty string for null input', () => {
      expect(service.sanitizeTweetContent(null as any)).toBe('');
    });

    it('should return empty string for undefined input', () => {
      expect(service.sanitizeTweetContent(undefined as any)).toBe('');
    });

    it('should return empty string for non-string input', () => {
      expect(service.sanitizeTweetContent(123 as any)).toBe('');
    });

    it('should return empty string for empty string', () => {
      expect(service.sanitizeTweetContent('')).toBe('');
    });

    it('should remove HTML and script tags', () => {
      const input = '<script>alert(1)</script>Hello World!';
      expect(service.sanitizeTweetContent(input)).toBe('Hello World!');
    });

    it('should remove dangerous characters', () => {
      const input = 'Hello<World:User"Name|File?*';
      expect(service.sanitizeTweetContent(input)).toBe('HelloWorldUserNameFile');
    });

    it('should keep alphanumeric, spaces, common punctuation, symbols', () => {
      const input = 'Hello @world! #hashtag $money %percent ^caret &ampersand *asterisk +plus =equals ~tilde `backtick {brace} [bracket] |pipe;colon';
      expect(service.sanitizeTweetContent(input)).toBe('Hello @world! #hashtag $money %percent ^caret &ampersand *asterisk +plus =equals ~tilde `backtick {brace} [bracket] |pipe;colon');
    });

    it('should normalize whitespace', () => {
      const input = 'Hello    World!';
      expect(service.sanitizeTweetContent(input)).toBe('Hello World!');
    });

    it('should trim leading and trailing whitespace', () => {
      const input = '   Hello World!   ';
      expect(service.sanitizeTweetContent(input)).toBe('Hello World!');
    });

    it('should limit length to 280 characters', () => {
      const input = 'a'.repeat(300);
      expect(service.sanitizeTweetContent(input).length).toBe(280);
    });

    it('should handle complex case with all sanitization rules', () => {
      const input = '   <script>alert(1)</script>Hello<World:User"Name|File?*   ';
      expect(service.sanitizeTweetContent(input)).toBe('HelloWorldUserNameFile');
    });
  });

  describe('containsDangerousContent', () => {
    it('should return false for null input', () => {
      expect(service.containsDangerousContent(null as any)).toBe(false);
    });

    it('should return false for undefined input', () => {
      expect(service.containsDangerousContent(undefined as any)).toBe(false);
    });

    it('should return false for non-string input', () => {
      expect(service.containsDangerousContent(123 as any)).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(service.containsDangerousContent('')).toBe(false);
    });

    it('should return false for normal text', () => {
      expect(service.containsDangerousContent('Hello World')).toBe(false);
    });

    describe('XSS Detection', () => {
      it('should detect script tags', () => {
        expect(service.containsDangerousContent('<script>alert(1)</script>')).toBe(true);
        expect(service.containsDangerousContent('<SCRIPT>alert(1)</SCRIPT>')).toBe(true);
        expect(service.containsDangerousContent('<ScRiPt>alert(1)</ScRiPt>')).toBe(true);
      });

      it('should detect iframe tags', () => {
        expect(service.containsDangerousContent('<iframe src="malicious.com"></iframe>')).toBe(true);
      });

      it('should detect javascript: protocol', () => {
        expect(service.containsDangerousContent('javascript:alert(1)')).toBe(true);
        expect(service.containsDangerousContent('JAVASCRIPT:alert(1)')).toBe(true);
      });

      it('should detect vbscript: protocol', () => {
        expect(service.containsDangerousContent('vbscript:msgbox("XSS")')).toBe(true);
      });

      it('should detect data: protocol', () => {
        expect(service.containsDangerousContent('data:text/html,<script>alert(1)</script>')).toBe(true);
      });

      it('should detect event handlers', () => {
        expect(service.containsDangerousContent('onclick="alert(1)"')).toBe(true);
        expect(service.containsDangerousContent('onload="alert(1)"')).toBe(true);
        expect(service.containsDangerousContent('onmouseover="alert(1)"')).toBe(true);
      });

      it('should detect eval() calls', () => {
        expect(service.containsDangerousContent('eval("alert(1)")')).toBe(true);
      });
    });

    describe('SQL Injection Detection', () => {
      it('should detect UNION SELECT', () => {
        expect(service.containsDangerousContent('UNION SELECT * FROM users')).toBe(true);
        expect(service.containsDangerousContent('union select * from users')).toBe(true);
      });

      it('should detect DROP TABLE', () => {
        expect(service.containsDangerousContent('DROP TABLE users')).toBe(true);
      });

      it('should detect DELETE FROM', () => {
        expect(service.containsDangerousContent('DELETE FROM users')).toBe(true);
      });

      it('should detect INSERT INTO', () => {
        expect(service.containsDangerousContent('INSERT INTO users')).toBe(true);
      });

      it('should detect UPDATE SET', () => {
        expect(service.containsDangerousContent('UPDATE users SET')).toBe(true);
      });

      it('should detect ALTER TABLE', () => {
        expect(service.containsDangerousContent('ALTER TABLE users')).toBe(true);
      });

      it('should detect CREATE TABLE', () => {
        expect(service.containsDangerousContent('CREATE TABLE users')).toBe(true);
      });

      it('should detect EXEC calls', () => {
        expect(service.containsDangerousContent('EXEC xp_cmdshell')).toBe(true);
      });

      it('should detect EXECUTE calls', () => {
        expect(service.containsDangerousContent('EXECUTE sp_executesql')).toBe(true);
      });
    });

    describe('NoSQL Injection Detection', () => {
      it('should detect MongoDB $where', () => {
        expect(service.containsDangerousContent('$where: "this.password"')).toBe(true);
      });

      it('should detect MongoDB $ne', () => {
        expect(service.containsDangerousContent('$ne: "active"')).toBe(true);
      });

      it('should detect MongoDB $gt', () => {
        expect(service.containsDangerousContent('$gt: 18')).toBe(true);
      });

      it('should detect MongoDB $lt', () => {
        expect(service.containsDangerousContent('$lt: 65')).toBe(true);
      });

      it('should detect MongoDB $regex', () => {
        expect(service.containsDangerousContent('$regex: "admin"')).toBe(true);
      });

      it('should detect MongoDB $in', () => {
        expect(service.containsDangerousContent('$in: ["admin"]')).toBe(true);
      });

      it('should detect MongoDB $nin', () => {
        expect(service.containsDangerousContent('$nin: ["admin"]')).toBe(true);
      });
    });

    describe('Command Injection Detection', () => {
      it('should detect backticks', () => {
        expect(service.containsDangerousContent('echo `whoami`')).toBe(true);
      });

      it('should detect command substitution', () => {
        expect(service.containsDangerousContent('echo $(whoami)')).toBe(true);
      });

      it('should detect parameter expansion', () => {
        expect(service.containsDangerousContent('echo ${USER}')).toBe(true);
      });
    });

    it('should detect mixed dangerous content', () => {
      const input = 'Hello <script>alert(1)</script> UNION SELECT * FROM users $where: "this.password"';
      expect(service.containsDangerousContent(input)).toBe(true);
    });

    it('should not detect false positives', () => {
      const input = 'Hello World! This is a normal message with words like "union" and "select" but not SQL injection.';
      expect(service.containsDangerousContent(input)).toBe(false);
    });
  });
}); 