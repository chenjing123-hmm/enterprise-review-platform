import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "隐私保护政策 - 企业点评",
  description: "企业点评平台隐私保护政策，说明个人信息收集、使用、存储及保护措施",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-slate-900">隐私保护政策</h1>
      <p className="mt-2 text-sm text-slate-500">
        生效日期：2024年1月1日 | 最后更新：2024年6月1日
      </p>

      <div className="mt-8 space-y-6 text-legal leading-relaxed text-slate-700">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">
            一、引言
          </h2>
          <p>
            企业点评平台（以下简称"本平台"或"我们"）深知个人信息对您的重要性，我们将严格遵守《中华人民共和国个人信息保护法》《中华人民共和国网络安全法》《中华人民共和国数据安全法》等法律法规，采取必要的安全保护措施，保护您的个人信息安全。本隐私保护政策（以下简称"本政策"）旨在向您说明我们如何收集、使用、存储、保护您的个人信息，以及您享有的相关权利。
          </p>
          <p className="mt-2">
            在使用本平台服务前，请您仔细阅读并充分理解本政策的全部内容。您点击"同意"按钮或实际使用本平台服务，即表示您已阅读、理解并同意我们按照本政策处理您的个人信息。如您不同意本政策的任何条款，请勿注册或使用本平台服务。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">
            二、我们收集的个人信息
          </h2>
          <p>
            我们仅收集实现平台功能所必需的个人信息，具体包括以下类型：
          </p>
          <p className="mt-2">
            <strong>（一）注册与认证信息：</strong>当您注册账号时，我们需要收集您的手机号码。当您使用评价发布功能时，根据《中华人民共和国网络安全法》第二十四条的实名制要求，我们需要收集您的真实姓名和身份证号码，用于实名身份核验。
          </p>
          <p className="mt-2">
            <strong>（二）设备与网络信息：</strong>当您使用本平台服务时，我们会自动收集您的设备信息（包括设备型号、操作系统版本、设备设置、唯一设备标识符）、IP地址、浏览器类型、访问时间、访问页面等日志信息，用于保障服务安全和稳定运行。
          </p>
          <p className="mt-2">
            <strong>（三）评价内容信息：</strong>当您发布评价时，我们会收集您提交的评价内容、职位名称、雇佣类型、工作起止时间、评分数据和上传的证明材料。
          </p>
          <p className="mt-2">
            <strong>（四）客户服务信息：</strong>当您联系我们的客服时，我们会收集您的联系方式、咨询内容和沟通记录，用于处理您的问题和改善服务。
          </p>
          <p className="mt-2">
            <strong>（五）Cookie及同类技术：</strong>我们使用Cookie和类似技术来提升用户体验，包括记住您的登录状态、偏好设置、统计分析等。您可以通过浏览器设置管理或删除Cookie。但请注意，禁用Cookie可能会影响您使用本平台的部分功能。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">
            三、Cookie的使用
          </h2>
          <p>
            本平台使用Cookie和同类技术（如Web Beacon、Local Storage等）来提升用户体验。Cookie是存储在您设备上的小型文本文件，用于记录您的偏好和状态信息。我们使用的Cookie包括：
          </p>
          <p className="mt-2">
            <strong>（一）必要Cookie：</strong>用于维持登录状态、保障服务安全等核心功能，此类Cookie无法禁用。
          </p>
          <p className="mt-2">
            <strong>（二）功能Cookie：</strong>用于记住您的偏好设置（如语言选择、搜索历史等），提升您的使用体验。
          </p>
          <p className="mt-2">
            <strong>（三）分析Cookie：</strong>用于统计和分析平台的访问量、用户行为等数据，帮助我们优化服务。我们使用自建统计系统，不会将分析数据共享给第三方分析服务商。
          </p>
          <p className="mt-2">
            您可以通过浏览器设置管理或删除Cookie。大多数浏览器默认允许Cookie，但您可以选择禁用。请注意，禁用Cookie可能导致部分功能不可用。我们不会将Cookie用于本政策所述目的之外的任何用途。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">
            四、个人信息的使用目的
          </h2>
          <p>
            我们收集的个人信息将用于以下目的：
          </p>
          <p className="mt-2">
            <strong>（一）提供与维护服务：</strong>使用您的注册信息创建和管理账号，使用您的实名信息进行身份核验，使用您的评价内容在平台展示。
          </p>
          <p className="mt-2">
            <strong>（二）安全保障：</strong>使用设备信息和日志信息进行安全分析，防范恶意攻击、欺诈、网络入侵等安全风险。
          </p>
          <p className="mt-2">
            <strong>（三）服务优化：</strong>使用匿名化的统计数据分析和改进平台的功能和服务质量。
          </p>
          <p className="mt-2">
            <strong>（四）法律合规：</strong>按照法律法规要求保存个人信息，配合执法部门的合法调查和取证。
          </p>
          <p className="mt-2">
            <strong>（五）沟通联系：</strong>使用您的手机号码向您发送重要的服务通知、安全提醒和账户变更信息。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">
            五、加密存储与安全保护
          </h2>
          <p>
            本平台高度重视您的个人信息安全，采取以下措施保护您的个人信息：
          </p>
          <p className="mt-2">
            <strong>（一）加密技术：</strong>您的身份证号码、真实姓名等敏感个人信息采用AES-256-GCM对称加密算法进行加密存储，密码使用bcrypt哈希算法加盐处理后存储，确保即使数据库泄露也无法还原原始信息。
          </p>
          <p className="mt-2">
            <strong>（二）传输安全：</strong>所有数据传输均采用TLS 1.3协议加密，确保数据在传输过程中不被窃取或篡改。
          </p>
          <p className="mt-2">
            <strong>（三）访问控制：</strong>我们建立了严格的内部数据访问权限管理制度，只有经过授权的工作人员在必要时才能访问您的个人信息，且所有访问操作均记录在审计日志中。
          </p>
          <p className="mt-2">
            <strong>（四）安全审计：</strong>定期进行安全漏洞扫描和渗透测试，及时发现和修复安全漏洞。
          </p>
          <p className="mt-2">
            <strong>（五）数据备份：</strong>定期进行数据备份，采用异地容灾策略，确保数据安全。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">
            六、第三方共享与披露限制
          </h2>
          <p>
            本平台承诺不会将您的个人信息出售给任何第三方。我们仅在以下情况下与第三方共享您的个人信息：
          </p>
          <p className="mt-2">
            <strong>（一）获得您的明确同意：</strong>在获得您的明确授权后，我们可以按照您同意的范围与第三方共享您的个人信息。
          </p>
          <p className="mt-2">
            <strong>（二）法律法规要求：</strong>根据法律法规规定、诉讼仲裁需要、或行政司法机关依法提出的要求，我们可能披露您的个人信息。
          </p>
          <p className="mt-2">
            <strong>（三）服务提供商：</strong>我们可能委托第三方服务提供商（如短信服务商、云存储服务商）处理您的个人信息。我们将与这些服务提供商签署严格的数据处理协议，要求其按照我们的指示、本政策以及法律法规的要求处理个人信息，不得用于其他目的。
          </p>
          <p className="mt-2">
            <strong>（四）实名认证服务商：</strong>为完成实名认证，我们需要将您的姓名和身份证号码提交至国家权威数据源进行比对核验。该核验过程仅返回核验结果（通过或不通过），不会向核验服务商披露您的完整身份信息。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">
            七、您的权利
          </h2>
          <p>
            根据《中华人民共和国个人信息保护法》，您对您的个人信息享有以下权利：
          </p>
          <p className="mt-2">
            <strong>（一）知情权与查阅权：</strong>您有权知悉我们收集和使用的个人信息类型和目的，并可以通过个人中心查看您已提交的个人信息。
          </p>
          <p className="mt-2">
            <strong>（二）更正权：</strong>如您发现我们收集的您的个人信息有误或不完整，您有权通过客服渠道申请更正。实名认证信息（姓名、身份证号码）变更需要提供相关证明材料，经平台审核后方可变更。
          </p>
          <p className="mt-2">
            <strong>（三）删除权：</strong>在以下情况下，您可以请求删除您的个人信息：（1）我们的处理目的已实现或无法实现；（2）我们停止提供产品或服务；（3）您撤回同意；（4）我们违反法律或约定处理您的个人信息。但法律法规另有规定的除外。
          </p>
          <p className="mt-2">
            <strong>（四）撤回同意权：</strong>您有权随时撤回您对个人信息处理的同意。撤回同意不影响撤回前基于同意进行的个人信息处理的合法性。撤回同意后，您可能无法继续使用需要该授权的功能。
          </p>
          <p className="mt-2">
            <strong>（五）注销账号权：</strong>您可以通过个人中心的"注销账号"功能申请注销账号。账号注销后，您的个人信息将按照本政策第八条的规定处理。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">
            八、数据保留期限
          </h2>
          <p>
            我们仅在实现本政策所述目的所必需的最短期限内保留您的个人信息，具体保留期限为自您最后一次登录账号之日起三年。超过保留期限的个人信息将进行删除或匿名化处理，使其无法识别特定个人。
          </p>
          <p className="mt-2">
            您主动申请注销账号的，我们将在7个工作日内完成账号注销处理。注销后：（一）您的实名认证信息（姓名、身份证号码、手机号码）将被永久删除；（二）您发布的评价内容将进行匿名化处理（隐藏发布者身份信息），但评价内容本身作为其他用户参考的信息将予以保留；（三）您的设备信息、日志信息将在保留期限届满后删除。
          </p>
          <p className="mt-2">
            法律法规另有规定要求更长时间保留的，我们将在法定保留期限内继续保留相关个人信息，保留期限届满后立即删除。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">
            九、未成年人保护
          </h2>
          <p>
            本平台主要面向成年用户，不以未成年人为目标用户。我们原则上不向未满18周岁的未成年人提供注册服务。未满18周岁的未成年人不得使用本平台的评价发布功能。如您为未满18周岁的未成年人，请在监护人陪同下阅读本政策，并在获得监护人同意后使用本平台的浏览功能。
          </p>
          <p className="mt-2">
            如我们发现平台在未获得监护人同意的情况下收集了未成年人的个人信息，我们将尽快删除相关数据。如您是未成年人的监护人，发现未成年人未经您同意在本平台注册或提供了个人信息，请及时与我们联系，我们将尽快处理。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">
            十、政策的更新与通知
          </h2>
          <p>
            我们可能根据法律法规变化和业务需要，适时更新本隐私保护政策。更新后的政策将在平台公告区公示，自公示之日起7日后生效。重大变更我们将通过平台公告、短信通知等方式告知您。如您不同意更新后的政策，可选择停止使用本平台服务。继续使用本平台服务即视为同意更新后的政策。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">
            十一、联系方式
          </h2>
          <p>
            如您对本隐私保护政策有任何疑问、意见或建议，或者希望行使您的个人信息相关权利，请通过以下方式与我们联系：个人信息保护负责人邮箱：privacy@enterprise-review.com；客服电话：400-XXX-XXXX；联系地址：中华人民共和国北京市朝阳区XXX路XXX号。我们将于收到您的联系后15个工作日内予以回复并处理。
          </p>
        </section>
      </div>
    </div>
  );
}