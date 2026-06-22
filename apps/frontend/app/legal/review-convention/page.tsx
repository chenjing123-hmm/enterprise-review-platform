import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "评价发布自律公约 - 企业点评",
  description: "企业点评平台评价发布自律公约，规范评价发布行为，保障评价真实性",
};

export default function ReviewConventionPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-slate-900">评价发布自律公约</h1>
      <p className="mt-2 text-sm text-slate-500">
        生效日期：2024年1月1日 | 最后更新：2024年6月1日
      </p>

      <div className="mt-8 space-y-6 text-legal leading-relaxed text-slate-700">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">
            一、总则
          </h2>
          <p>
            为维护企业点评平台（以下简称"本平台"）的良好秩序，保障评价内容的真实性、客观性和合法性，维护企业、用户及社会公众的合法权益，根据《中华人民共和国网络安全法》《中华人民共和国个人信息保护法》《网络信息内容生态治理规定》等法律法规，制定本《评价发布自律公约》（以下简称"本公约"）。所有在本平台发布评价的用户，均须遵守本公约的各项规定。用户在发布评价前，须认真阅读并勾选同意本公约内容。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">
            二、评价真实性原则
          </h2>
          <p>
            用户发布的评价内容必须基于真实的工作经历。用户不得发布以下类型的评价：
          </p>
          <p className="mt-2">
            <strong>（一）捏造虚假评价：</strong>用户从未在该企业工作过或与该企业有过雇佣关系，但却编造工作经历并发布评价的。此类行为属于严重违规，一经发现将永久封禁账号，并保留追究法律责任的权利。
          </p>
          <p className="mt-2">
            <strong>（二）夸大或歪曲事实：</strong>用户虽在该企业工作过，但评价内容严重偏离实际情况，对企业的待遇、环境、管理等方面进行不实描述或恶意夸大的。用户应尽量客观、如实地描述工作体验。
          </p>
          <p className="mt-2">
            <strong>（三）委托他人代写评价：</strong>用户委托他人代为撰写评价内容，或接受他人委托代为撰写评价内容的。评价须由本人亲自撰写，不得由他人代写。
          </p>
          <p className="mt-2">
            <strong>（四）以营利为目的的评价：</strong>用户接受企业或其他第三方的报酬或利益，以发布正面评价或负面评价为目的的。本平台严禁任何形式的商业评价行为，违者将予以封号处理。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">
            三、禁止诽谤与侮辱
          </h2>
          <p>
            用户发布的评价内容不得含有诽谤、侮辱、人身攻击等侵害他人合法权益的内容。具体禁止行为包括：
          </p>
          <p className="mt-2">
            <strong>（一）诽谤：</strong>捏造事实，损害企业或个人的名誉。例如：编造企业存在违法行为、编造企业负责人存在不道德行为等。如用户确实掌握企业违法行为的证据，应当向相关执法部门举报，而非在评价中发布未经核实的不实信息。
          </p>
          <p className="mt-2">
            <strong>（二）侮辱：</strong>使用侮辱性、贬损性语言描述企业或其员工。例如：使用脏话、诅咒性语言、歧视性语言等。评价内容应当客观、理性，使用文明用语。
          </p>
          <p className="mt-2">
            <strong>（三）人身攻击：</strong>针对企业特定个人（如企业负责人、管理人员、HR等）进行攻击性评价。评价内容应针对企业整体或工作体验，不得针对特定个人进行攻击。如需提及具体人员，应使用职务称谓（如"部门经理"、"HR负责人"等），不得使用真实姓名。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">
            四、证明材料上传要求
          </h2>
          <p>
            为保障评价内容的真实性，用户在发布评价时必须上传至少一份证明材料。证明材料的要求如下：
          </p>
          <p className="mt-2">
            <strong>（一）可接受的证明材料类型：</strong>劳动合同（可遮盖薪资、身份证号等个人敏感信息）、工牌或工作证照片、工资单或银行流水（可遮盖金额）、社保或公积金缴纳记录截图、企业邮箱或内部通讯系统的工作记录截图、离职证明、在职证明等能够证明用户与企业之间存在真实雇佣关系的材料。
          </p>
          <p className="mt-2">
            <strong>（二）证明材料要求：</strong>证明材料须为真实、清晰、未经修改的原始文件。不得使用PS等工具修改证明材料内容（除必要的个人信息遮盖外）。不得使用他人的证明材料冒充自己的。不得使用伪造的证明材料。
          </p>
          <p className="mt-2">
            <strong>（三）文件格式与大小：</strong>证明材料仅支持JPG、PNG、PDF格式，单个文件大小不超过10MB。一次评价最多可上传5份证明材料。
          </p>
          <p className="mt-2">
            <strong>（四）材料保密：</strong>用户上传的证明材料仅用于平台审核人员核实评价真实性，不会公开展示给其他用户。审核完成后，证明材料将在60日内自动删除。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">
            五、隐私保护要求
          </h2>
          <p>
            用户在评价内容中不得泄露以下隐私信息：
          </p>
          <p className="mt-2">
            <strong>（一）个人隐私信息：</strong>不得在评价内容中直接或间接泄露他人的真实姓名、身份证号码、手机号码、家庭住址、银行卡号、电子邮箱、社交媒体账号等能够识别特定个人的信息。
          </p>
          <p className="mt-2">
            <strong>（二）企业商业秘密：</strong>不得泄露企业的商业秘密和未公开信息，包括但不限于：未公开的财务数据、未公开的产品研发计划、客户名单、定价策略、商业合同细节、未公开的薪酬数据（非本人的）、未公开的组织架构调整方案等。
          </p>
          <p className="mt-2">
            <strong>（三）他人评价内容：</strong>不得在评价中引用或转载其他用户的评价内容（包括本平台或其他平台的评价内容），不得对其他用户进行点名或含沙射影的评论。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">
            六、内容审核机制
          </h2>
          <p>
            本平台实行"先审后发"机制。用户提交评价后，评价内容将进入审核流程，审核通过后方可公开展示。审核流程包括：
          </p>
          <p className="mt-2">
            <strong>（一）自动审核：</strong>系统自动检测评价内容是否包含违禁词汇、敏感词、联系方式、网址链接等。如检测到违禁内容，系统将自动拦截并提示用户修改。
          </p>
          <p className="mt-2">
            <strong>（二）人工审核：</strong>平台审核人员对评价内容进行人工审核，检查内容是否违反本公约的规定，证明材料是否真实有效。审核人员将根据审核标准做出通过、驳回（需修改后重新提交）或拒绝（永久拒绝）的决定。
          </p>
          <p className="mt-2">
            <strong>（三）审核时效：</strong>本平台承诺在用户提交评价后24小时内完成审核。如遇节假日或审核量激增，审核时间可能适当延长，但最长不超过72小时。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">
            七、发布前确认要求
          </h2>
          <p>
            用户在提交评价前，必须完成以下确认步骤：
          </p>
          <p className="mt-2">
            <strong>（一）勾选同意本公约：</strong>用户须在评价提交页面勾选"我已阅读并同意《评价发布自律公约》"复选框，方可提交评价。该勾选具有法律效力，表明用户已充分理解并愿意遵守本公约的全部规定。
          </p>
          <p className="mt-2">
            <strong>（二）确认评价真实性：</strong>用户须确认其评价内容基于真实的工作经历，所上传的证明材料真实有效。如用户做出虚假确认，将承担相应的法律责任。
          </p>
          <p className="mt-2">
            <strong>（三）确认不包含违禁内容：</strong>用户须确认其评价内容不包含本公约第四条、第五条、第六条所禁止的任何内容。如用户违反此确认，平台将按照本公约第八条的规定进行处理。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">
            八、违规处理措施
          </h2>
          <p>
            用户违反本公约的，本平台将根据违规情节的严重程度，采取以下一项或多项处理措施：
          </p>
          <p className="mt-2">
            <strong>（一）评价删除：</strong>删除违规评价内容，并通知用户删除原因。此为最轻微的处理措施，适用于首次违规且情节较轻的情况。
          </p>
          <p className="mt-2">
            <strong>（二）禁言：</strong>限制用户在一定期限内（7天至30天）发布评价和评论的能力。适用于多次违规或违规情节较重的情况。
          </p>
          <p className="mt-2">
            <strong>（三）账号封禁：</strong>永久封禁用户账号，禁止用户使用本平台的所有服务。适用于严重违规的情况，包括但不限于：发布虚假评价、恶意诽谤、泄露他人隐私、泄露商业秘密、多次违规且屡教不改等。
          </p>
          <p className="mt-2">
            <strong>（四）法律追究：</strong>对于涉嫌违反法律法规的严重违规行为，本平台将保留依法向公安机关、网信部门等执法机关报告的权利，并配合执法机关进行调查取证。
          </p>
          <p className="mt-2">
            用户对处理决定有异议的，可在收到处理通知后7日内通过客服渠道提出申诉，平台将在5个工作日内复核并回复。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">
            九、公约的效力
          </h2>
          <p>
            本公约是本平台《用户服务协议》的组成部分，与《用户服务协议》具有同等法律效力。用户点击同意本公约，即视为同意并接受本公约的全部条款。本公约的最终解释权归本平台所有。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">
            十、联系方式
          </h2>
          <p>
            如您对本公约有任何疑问、意见或建议，请通过以下方式与我们联系：电子邮箱：legal@enterprise-review.com；客服电话：400-XXX-XXXX；联系地址：中华人民共和国北京市朝阳区XXX路XXX号。
          </p>
        </section>
      </div>
    </div>
  );
}