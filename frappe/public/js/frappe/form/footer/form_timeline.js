// Copyright (c) 2020, Frappe Technologies Pvt. Ltd. and Contributors
// MIT License. See license.txt
import BaseTimeline from "./base_timeline";
import { get_version_timeline_content } from "./version_timeline_content_builder";

class FormTimeline extends BaseTimeline {

	
	make() {
		super.make();
		this.setup_timeline_actions();
		this.render_timeline_items();
		this.setup_activity_toggle();
	}

	refresh() {
		super.refresh();
		this.frm.trigger('timeline_refresh');
		this.setup_document_email_link();
	}

	setup_timeline_actions() {
		this.add_action_button(__('New Email'), () => this.compose_mail(), 'mail', 'btn-secondary-dark');
		this.add_help_scout_action_button(__('New Help Scout Email'), () => this.compose_help_scout_email());
		this.setup_new_event_button();
	}

	setup_new_event_button() {
		if (this.frm.meta.allow_events_in_timeline) {
			let create_event = () => {
				const args = {
					doc: this.frm.doc,
					frm: this.frm,
					recipients: this.get_recipient(),
					txt: frappe.markdown(this.frm.comment_box.get_value())
				};
				return new frappe.views.InteractionComposer(args);
			};
			this.add_action_button(__('New Event'), create_event, 'calendar');
		}
	}

	setup_activity_toggle() {
		let doc_info = this.doc_info || this.frm.get_docinfo();
		let has_communications = () => {
			let communications = doc_info.communications;
			let comments = doc_info.comments;
			return (communications || []).length || (comments || []).length;
		};
		let me = this;
		if (has_communications()) {
			this.timeline_wrapper.prepend(`
				<div class="timeline-item activity-toggle">
					<div class="timeline-dot"></div>
					<div class="timeline-content flex align-center">
						<h4>${__('Activity')}</h4>
						<nav class="nav nav-pills flex-row">
							<a class="flex-sm-fill text-sm-center nav-link" data-only-communication="true">${__('Communication')}</a>
							<a class="flex-sm-fill text-sm-center nav-link active">${__('All')}</a>
						</nav>
					</div>
				</div>
			`).find('a').on('click', function(e) {
				e.preventDefault();
				me.only_communication = $(this).data().onlyCommunication;
				me.render_timeline_items();
				$(this).tab('show');
			});
		}
	}

	setup_document_email_link() {
		let doc_info = this.doc_info || this.frm.get_docinfo();

		this.document_email_link_wrapper && this.document_email_link_wrapper.remove();

		if (doc_info.document_email) {
			const link = `<a class="document-email-link">${doc_info.document_email}</a>`;
			const message = __("Add to this activity by mailing to {0}", [link.bold()]);

			this.document_email_link_wrapper = $(`
				<div class="timeline-item">
					<div class="timeline-dot"></div>
					<div class="timeline-content">
						<span>${message}</span>
					</div>
				</div>
			`);
			this.timeline_actions_wrapper.append(this.document_email_link_wrapper);

			this.document_email_link_wrapper
				.find('.document-email-link')
				.on("click", e => {
					let text = $(e.target).text();
					frappe.utils.copy_to_clipboard(text);
				});
		}
	}

	render_timeline_items() {
		super.render_timeline_items();
		this.set_document_info();
	}

	set_document_info() {
		// TODO: handle creation via automation
		const creation = comment_when(this.frm.doc.creation);
		let creation_message =
			frappe.utils.is_current_user(this.frm.doc.owner)
				? __("You created this {0}", [creation], "Form timeline")
				: __("{0} created this {1}",
					[
						this.get_user_link(this.frm.doc.owner),
						creation
					],
					"Form timeline"
				);

		const modified = comment_when(this.frm.doc.modified);
		let modified_message =
			frappe.utils.is_current_user(this.frm.doc.modified_by)
				? __("You edited this {0}", [modified], "Form timeline")
				: __("{0} edited this {1}",
					[
						this.get_user_link(this.frm.doc.modified_by),
						modified
					],
					"Form timeline"
				);

		if (this.frm.doc.route && cint(frappe.boot.website_tracking_enabled)) {
			let route = this.frm.doc.route;
			frappe.utils.get_page_view_count(route).then((res) => {
				let page_view_count_message = __('{0} Page views', [res.message], "Form timeline");
				this.add_timeline_item({
					content: `${creation_message} • ${modified_message} • 	${page_view_count_message}`,
					hide_timestamp: true
				}, true);
			});
		} else {
			this.add_timeline_item({
				content: `${creation_message} • ${modified_message}`,
				hide_timestamp: true
			}, true);
		}
	}

	prepare_timeline_contents() {
		this.timeline_items.push(...this.get_communication_timeline_contents());
		this.timeline_items.push(...this.get_auto_messages_timeline_contents());
		this.timeline_items.push(...this.get_comment_timeline_contents());
		if (!this.only_communication) {
			this.timeline_items.push(...this.get_view_timeline_contents());
			this.timeline_items.push(...this.get_energy_point_timeline_contents());
			this.timeline_items.push(...this.get_version_timeline_contents());
			this.timeline_items.push(...this.get_share_timeline_contents());
			this.timeline_items.push(...this.get_workflow_timeline_contents());
			this.timeline_items.push(...this.get_like_timeline_contents());
			this.timeline_items.push(...this.get_custom_timeline_contents());
			this.timeline_items.push(...this.get_assignment_timeline_contents());
			this.timeline_items.push(...this.get_attachment_timeline_contents());
			this.timeline_items.push(...this.get_info_timeline_contents());
			this.timeline_items.push(...this.get_milestone_timeline_contents());
		}
	}

	get_user_link(user) {
		const user_display_text = (frappe.user_info(user).fullname || '').bold();
		return frappe.utils.get_form_link('User', user, true, user_display_text);
	}

	get_view_timeline_contents() {
		let view_timeline_contents = [];
		(this.doc_info.views || []).forEach(view => {
			const view_time = comment_when(view.creation);
			let view_message = frappe.utils.is_current_user(view.owner)
				? __("You viewed this {0}", [view_time], "Form timeline")
				: __("{0} viewed this {1}",
					[
						this.get_user_link(view.owner),
						view_time
					],
					"Form timeline"
				);

			view_timeline_contents.push({
				creation: view.creation,
				content: view_message,
				hide_timestamp: true,
			});
		});
		return view_timeline_contents;
	}

	get_communication_timeline_contents() {
		let communication_timeline_contents = [];
		let icon_set = {Email: "mail", Phone: "call", Meeting: "calendar", Other: "dot-horizontal"};
		(this.doc_info.communications|| []).forEach(communication => {
			let medium = communication.communication_medium;
			communication_timeline_contents.push({
				icon: icon_set[medium],
				icon_size: 'sm',
				creation: communication.creation,
				is_card: true,
				content: this.get_communication_timeline_content(communication),
				doctype: "Communication",
				name: communication.name
			});
		});
		return communication_timeline_contents;
	}

	get_communication_timeline_content(doc, allow_reply=true) {
		doc._url = frappe.utils.get_form_link("Communication", doc.name);
		this.set_communication_doc_status(doc);
		if (doc.attachments && typeof doc.attachments === "string") {
			doc.attachments = JSON.parse(doc.attachments);
		}
		doc.owner = doc.sender;
		doc.user_full_name = doc.sender_full_name;
		doc.content = frappe.dom.remove_script_and_style(doc.content);
		let communication_content = $(frappe.render_template('timeline_message_box', { doc }));
		if (allow_reply) {
			this.setup_reply(communication_content, doc);
		}
		return communication_content;
	}

	set_communication_doc_status(doc) {
		let indicator_color = "red";
		if (in_list(["Sent", "Clicked"], doc.delivery_status)) {
			indicator_color = "green";
		} else if (doc.delivery_status === "Sending") {
			indicator_color = "orange";
		} else if (in_list(["Opened", "Read"], doc.delivery_status)) {
			indicator_color = "blue";
		} else if (doc.delivery_status == "Error") {
			indicator_color = "red";
		}
		doc._doc_status = doc.delivery_status;
		doc._doc_status_indicator = indicator_color;
	}

	get_auto_messages_timeline_contents() {
		let auto_messages_timeline_contents = [];
		(this.doc_info.automated_messages|| []).forEach(message => {
			auto_messages_timeline_contents.push({
				icon: 'notification',
				icon_size: 'sm',
				creation: message.creation,
				is_card: true,
				content: this.get_communication_timeline_content(message, false),
				doctype: "Communication",
				name: message.name
			});
		});
		return auto_messages_timeline_contents;
	}

	get_comment_timeline_contents() {
		let comment_timeline_contents = [];
		(this.doc_info.comments || []).forEach(comment => {
			comment_timeline_contents.push(this.get_comment_timeline_item(comment));
		});
		return comment_timeline_contents;
	}

	get_comment_timeline_item(comment) {
		return {
			icon: 'small-message',
			creation: comment.creation,
			is_card: true,
			doctype: "Comment",
			name: comment.name,
			content: this.get_comment_timeline_content(comment),
		};
	}

	get_comment_timeline_content(doc) {
		doc.content = frappe.dom.remove_script_and_style(doc.content);
		const comment_content = $(frappe.render_template('timeline_message_box', { doc }));
		this.setup_comment_actions(comment_content, doc);
		return comment_content;
	}

	get_version_timeline_contents() {
		let version_timeline_contents = [];
		(this.doc_info.versions || []).forEach(version => {
			const contents = get_version_timeline_content(version, this.frm);
			contents.forEach((content) => {
				version_timeline_contents.push({
					creation: version.creation,
					content: content,
				});
			});
		});
		return version_timeline_contents;
	}

	get_share_timeline_contents() {
		let share_timeline_contents = [];
		(this.doc_info.share_logs || []).forEach(share_log => {
			share_timeline_contents.push({
				creation: share_log.creation,
				content: share_log.content,
			});
		});
		return share_timeline_contents;
	}

	get_assignment_timeline_contents() {
		let assignment_timeline_contents = [];
		(this.doc_info.assignment_logs || []).forEach(assignment_log => {
			assignment_timeline_contents.push({
				creation: assignment_log.creation,
				content: assignment_log.content,
			});
		});
		return assignment_timeline_contents;
	}

	get_info_timeline_contents() {
		let info_timeline_contents = [];
		(this.doc_info.info_logs || []).forEach(info_log => {
			info_timeline_contents.push({
				creation: info_log.creation,
				content: `${this.get_user_link(info_log.owner)} ${info_log.content}`,
			});
		});
		return info_timeline_contents;
	}

	get_attachment_timeline_contents() {
		let attachment_timeline_contents = [];
		(this.doc_info.attachment_logs || []).forEach(attachment_log => {
			let is_file_upload = attachment_log.comment_type == 'Attachment';
			attachment_timeline_contents.push({
				icon: is_file_upload ? 'upload' : 'delete',
				icon_size: 'sm',
				creation: attachment_log.creation,
				content: `${this.get_user_link(attachment_log.owner)} ${attachment_log.content}`,
			});
		});
		return attachment_timeline_contents;
	}

	get_milestone_timeline_contents() {
		let milestone_timeline_contents = [];
		(this.doc_info.milestones || []).forEach(milestone_log => {
			milestone_timeline_contents.push({
				icon: 'milestone',
				creation: milestone_log.creation,
				content: __('{0} changed {1} to {2}', [
					this.get_user_link(milestone_log.owner),
					frappe.meta.get_label(this.frm.doctype, milestone_log.track_field),
					milestone_log.value.bold()]),
			});
		});
		return milestone_timeline_contents;
	}

	get_like_timeline_contents() {
		let like_timeline_contents = [];
		(this.doc_info.like_logs || []).forEach(like_log => {
			like_timeline_contents.push({
				icon: 'heart',
				icon_size: 'sm',
				creation: like_log.creation,
				content: __('{0} Liked', [this.get_user_link(like_log.owner)]),
				title: "Like",
			});
		});
		return like_timeline_contents;
	}

	get_workflow_timeline_contents() {
		let workflow_timeline_contents = [];
		(this.doc_info.workflow_logs || []).forEach(workflow_log => {
			workflow_timeline_contents.push({
				icon: 'branch',
				icon_size: 'sm',
				creation: workflow_log.creation,
				content: `${this.get_user_link(workflow_log.owner)} ${__(workflow_log.content)}`,
				title: "Workflow",
			});
		});
		return workflow_timeline_contents;
	}

	get_custom_timeline_contents() {
		let custom_timeline_contents = [];
		(this.doc_info.additional_timeline_content || []).forEach(custom_item => {
			custom_timeline_contents.push({
				icon: custom_item.icon,
				icon_size: 'sm',
				is_card: custom_item.is_card,
				creation: custom_item.creation,
				content: custom_item.content || frappe.render_template(custom_item.template, custom_item.template_data),
			});
		});
		return custom_timeline_contents;
	}

	get_energy_point_timeline_contents() {
		let energy_point_timeline_contents = [];
		(this.doc_info.energy_point_logs || []).forEach(log => {
			let timeline_badge = `
			<div class="timeline-badge ${log.points > 0 ? 'appreciation': 'criticism'} bold">
				${log.points}
			</div>`;

			energy_point_timeline_contents.push({
				timeline_badge: timeline_badge,
				creation: log.creation,
				content: frappe.energy_points.format_form_log(log)
			});
		});
		return energy_point_timeline_contents;
	}

	setup_reply(communication_box, communication_doc) {
		let actions = communication_box.find('.actions');
		let reply = $(`<a class="action-btn reply">${frappe.utils.icon('reply', 'md')}</a>`).click(() => {
			this.compose_mail(communication_doc);
		});
		let reply_all = $(`<a class="action-btn reply-all">${frappe.utils.icon('reply-all', 'md')}</a>`).click(() => {
			this.compose_mail(communication_doc, true);
		});
		actions.append(reply);
		actions.append(reply_all);
	}

	compose_mail(communication_doc=null, reply_all=false) {
		const args = {
			doc: this.frm.doc,
			frm: this.frm,
			recipients: communication_doc && communication_doc.sender != frappe.session.user_email ? communication_doc.sender : this.get_recipient(),
			is_a_reply: Boolean(communication_doc),
			title: communication_doc ? __('Reply') : null,
			last_email: communication_doc,
			subject: communication_doc && communication_doc.subject
		};

		if (communication_doc && reply_all) {
			args.cc = communication_doc.cc;
			args.bcc = communication_doc.bcc;
		}

		if (this.frm.doctype === "Communication") {
			args.message = "";
			args.last_email = this.frm.doc;
			args.recipients = this.frm.doc.sender;
			args.subject = __("Re: {0}", [this.frm.doc.subject]);
		} else {
			const comment_value = frappe.markdown(this.frm.comment_box.get_value());
			args.message = strip_html(comment_value) ? comment_value : '';
		}

		new frappe.views.CommunicationComposer(args);
	}

	/*****************************/
	//helpscout to erpnext integration starts here
	/*****************************/
	
	compose_help_scout_email() {
		const me = this;

		this.dialog = new frappe.ui.Dialog({
			title: __("New Help Scout Email"),
			no_submit_on_enter: true,
			fields: this.get_fields(),
			primary_action_label: __("Send"),
			primary_action() {
				me.send_action();
				me.dialog.hide();
			},
			secondary_action_label: __("Discard"),
			secondary_action() {
				me.dialog.hide();
				me.clear_cache();
			},
			size: 'large',
			minimizable: true
		});
		$(this.dialog.$wrapper.find('form').first().css({"display":"flex", "align-items": "center"}))
		$(this.dialog.$wrapper.find('div[data-fieldname ="recipients"]').css({"flex": "1"}))
		$(this.dialog.$wrapper.find('div[data-fieldname ="option_toggle_button"]').css({"margin-left": "10px", "margin-bottom": "-24px"}))
		$(this.dialog.$wrapper.find('button[data-fieldname ="option_toggle_button"]').css({"height": "calc(1.5em + .75rem + 2px)"}))
		this.prepare();
		this.dialog.show();

		if (this.frm) {
			$(document).trigger('form-typing', [this.frm]);
		}
	}

	get_fields() {
		const fields = [
			{
				label: __("To"),
				fieldtype: "Link",
				options: "User",
				fieldname: "recipients",
			},
			{
				fieldtype: "Button",
				label: frappe.utils.icon('down'),
				fieldname: 'option_toggle_button',
				click: () => {
					this.toggle_more_options();
				}
			},
			{
				fieldtype: "Section Break",
				hidden: 1,
				fieldname: "more_options"
			},
			{
				label: __("CC"),
				fieldtype: "MultiSelect",
				fieldname: "cc",
			},
			{
				label: __("BCC"),
				fieldtype: "MultiSelect",
				fieldname: "bcc",
			},
			{ fieldtype: "Section Break" },
			{
				label: __("Subject"),
				fieldtype: "Data",
				reqd: 1,
				fieldname: "subject",
				length: 524288
			},
			{
				label: __("Message"),
				fieldtype: "Small Text",
				fieldname: "content",
				onchange: frappe.utils.debounce(
					this.save_as_draft.bind(this),
					300
				)
			},
			{ fieldtype: "Section Break" },
			{
				label : "Mail Box",
				fieldname: "mail_box",
				fieldtype: "Select",
				reqd: 1,
				options: ["Software", "Purchasing","Service"]
			},
			{
				label: __("Attach Document Print"),
				fieldtype: "Check",
				fieldname: "attach_document_print"
			},
			{
				label: __("Select Print Format"),
				fieldtype: "Select",
				fieldname: "select_print_format"
			},
			{ fieldtype: "Column Break" },
			{
				label: __("Select Attachments"),
				fieldtype: "HTML",
				fieldname: "select_attachments"
			}
		];
		
		return fields;
	}

	toggle_more_options(show_options) {
		show_options = show_options || this.dialog.fields_dict.more_options.df.hidden;
		this.dialog.set_df_property('more_options', 'hidden', !show_options);

		const label = frappe.utils.icon(show_options ? 'up-line': 'down');
		this.dialog.get_field('option_toggle_button').set_label(label);
	}

	prepare() {
		this.setup_multiselect_queries();
		this.setup_subject_and_recipients();
		this.setup_print();
		this.setup_attach();
		this.setup_email();
	}

	setup_add_signature_button() {
		let has_sender = this.dialog.has_field('sender');
		this.dialog.set_df_property('add_signature', 'hidden', !has_sender);
	}

	setup_multiselect_queries() {
		['recipients', 'cc', 'bcc'].forEach(field => {
			this.dialog.fields_dict[field].get_data = () => {
				const data = this.dialog.fields_dict[field].get_value();
				const txt = data.match(/[^,\s*]*$/)[0] || '';

				frappe.call({
					method: "frappe.email.get_contact_list",
					args: {txt},
					callback: (r) => {
						this.dialog.fields_dict[field].set_data(r.message);
					}
				});
			};
		});
	}

	setup_subject_and_recipients() {
		this.subject = this.subject || "";

		if (!this.forward && !this.recipients && this.last_email) {
			this.recipients = this.last_email.sender;
			this.cc = this.last_email.cc;
			this.bcc = this.last_email.bcc;
		}

		if (!this.forward && !this.recipients) {
			this.recipients = this.frm && this.frm.timeline.get_recipient();
		}

		if (!this.subject && this.frm) {

			const last = this.frm.timeline.get_last_email();

			if (last) {
				this.subject = last.subject;
				if (!this.recipients) {
					this.recipients = last.sender;
				}


				if (strip(this.subject.toLowerCase().split(":")[0])!="re") {
					this.subject = __("Re: {0}", [this.subject]);
				}
			}

			if (!this.subject) {
				this.subject = this.frm.doc.name;
				if (this.frm.meta.subject_field && this.frm.doc[this.frm.meta.subject_field]) {
					this.subject = this.frm.doc[this.frm.meta.subject_field];
				} else if (this.frm.meta.title_field && this.frm.doc[this.frm.meta.title_field]) {
					this.subject = this.frm.doc[this.frm.meta.title_field];
				}
			}

			
			const identifier = `#${this.frm.doc.name}`;

			if (!cstr(this.subject).includes(identifier)) {
				this.subject = `${this.subject} (${identifier})`;
			}
		}

		if (this.frm && !this.recipients) {
			this.recipients = this.frm.doc[this.frm.email_field];
		}
	}

	selected_format() {
		return (
			this.dialog.fields_dict.select_print_format.input.value
			|| this.frm && this.frm.meta.default_print_format
			|| "Standard"
		);
	}

	get_print_format(format) {
		if (!format) {
			format = this.selected_format();
		}

		if (locals["Print Format"] && locals["Print Format"][format]) {
			return locals["Print Format"][format];
		} else {
			return {};
		}
	}

	setup_print() {
		// print formats
		const fields = this.dialog.fields_dict;

		// toggle print format
		$(fields.attach_document_print.input).click(function() {
			$(fields.select_print_format.wrapper).toggle($(this).prop("checked"));
		});

		// select print format
		$(fields.select_print_format.wrapper).toggle(false);

		if (this.frm) {
			const print_formats = frappe.meta.get_print_formats(this.frm.meta.name);
			$(fields.select_print_format.input)
				.empty()
				.add_options(print_formats)
				.val(print_formats[0]);
		} else {
			$(fields.attach_document_print.wrapper).toggle(false);
		}

	}

	setup_attach() {
		const fields = this.dialog.fields_dict;
		const attach = $(fields.select_attachments.wrapper);

		if (!this.attachments) {
			this.attachments = [];
		}

		let args = {
			folder: 'Home/Attachments',
			on_success: attachment => {
				this.attachments.push(attachment);
				this.render_attachment_rows(attachment);
			}
		};

		if (this.frm) {
			args = {
				doctype: this.frm.doctype,
				docname: this.frm.docname,
				folder: 'Home/Attachments',
				on_success: attachment => {
					this.frm.attachments.attachment_uploaded(attachment);
					this.render_attachment_rows(attachment);
				}
			};
		}

		$(`
			<label class="control-label">
				${__("Select Attachments")}
			</label>
			<div class='attach-list'></div>
			<p class='add-more-attachments'>
				<button class='btn btn-xs btn-default'>
					${frappe.utils.icon('small-add', 'xs')}&nbsp;
					${__("Add Attachment")}
				</button>
			</p>
		`).appendTo(attach.empty());

		attach
			.find(".add-more-attachments button")
			.on('click', () => new frappe.ui.FileUploader(args));
		this.render_attachment_rows();
	}

	render_attachment_rows(attachment) {
		const select_attachments = this.dialog.fields_dict.select_attachments;
		const attachment_rows = $(select_attachments.wrapper).find(".attach-list");
		if (attachment) {
			attachment_rows.append(this.get_attachment_row(attachment, true));
		} else {
			let files = [];
			if (this.attachments && this.attachments.length) {
				files = files.concat(this.attachments);
			}
			if (this.frm) {
				files = files.concat(this.frm.get_files());
			}

			if (files.length) {
				$.each(files, (i, f) => {
					if (!f.file_name) return;
					if (!attachment_rows.find(`[data-file-name="${f.name}"]`).length) {
						f.file_url = frappe.urllib.get_full_url(f.file_url);
						attachment_rows.append(this.get_attachment_row(f));
					}
				});
			}
		}
	}

	get_attachment_row(attachment, checked) {
		return $(`<p class="checkbox flex">
			<label style="display: block; !important" class="ellipsis" title="${attachment.file_name}">
				<input
					style="display: inline-block; vertical-align: middle;"
					type="checkbox"
					data-file-name="${attachment.name}"
					data-tile="${attachment.file_name}"
					${checked ? 'checked': ''}>
				</input>
				<span class="ellipsis">${attachment.file_name}</span>
			</label>
			&nbsp;
			<a href="${attachment.file_url}" target="_blank" class="btn-linkF">
				${frappe.utils.icon('link-url')}
			</a>
		</p>`);
	}

	setup_email() {
		// email
		const fields = this.dialog.fields_dict;

		if (this.attach_document_print) {
			$(fields.attach_document_print.input).click();
			$(fields.select_print_format.wrapper).toggle(true);
		}
	}

	url_to_base64(url, callback) {
		var xhr = new XMLHttpRequest();
		xhr.onload = function() {
			var reader = new FileReader();
			reader.onloadend = function() {
				callback(reader.result);
			}
			reader.readAsDataURL(xhr.response);
		};
		xhr.open('GET', url);
		xhr.responseType = 'blob';
		xhr.send();
	}

	send_action() {
		const me = this;
		const base_url = window.location.origin
		const btn = me.dialog.get_primary_btn();
		const form_values = this.get_values();
		var mailboxID = 0
		var base64_list = []
		var url = []
		var url_base64 = []
		var email_cc = []
		var email_bcc = []
		var mime_type_list = []
		var docname = this.frm.docname
		var doctype = this.frm.doctype
		if (!form_values) return;

		const selected_attachments =
			$.map($(me.dialog.wrapper).find("[data-file-name]:checked"), function (element) {
				return base_url + "/private/files/" + $(element).attr("data-tile");
			});
		
		const link = frappe.urllib.get_full_url(`/api/method/frappe.utils.print_format.download_pdf?doctype=${encodeURIComponent(this.frm.doctype)}&name=${encodeURIComponent(this.frm.docname)}&format=${encodeURIComponent(form_values.select_print_format)}&lang=${encodeURIComponent(cur_frm.doc.language)}`)

	    if (cur_dialog.fields_dict.mail_box.value == "Software") {
	        mailboxID = 278320
	    } else if (cur_dialog.fields_dict.mail_box.value == "Purchasing") {
	        mailboxID = 72667
	    } else {
	        mailboxID = 39736
	    }

		var counter = 0

		if (form_values.attach_document_print != 0) {
			selected_attachments.push(link)
		}
		if (selected_attachments.length > 0) {

			selected_attachments.forEach(element => url.push({'url': element}));
			var attachments_length = selected_attachments.length
			selected_attachments.forEach(element => this.url_to_base64(element, function(myBase64) {
				counter += 1
				base64_list.push(myBase64.split(',')[1].trim())
				mime_type_list.push(myBase64.substring(myBase64.indexOf(":") + 1, myBase64.indexOf(";base64")))
				if (counter == attachments_length) {
					url_base64 = url.map((o, i) => ({url: o.url, data: base64_list[i], mimetype: mime_type_list[i]}))

					frappe.call({
						method: 'newmatik.api.help_scout.send_email',
						args: {
							'subject': form_values.subject,
							'reciever': form_values.recipients,
							'mailbox': mailboxID,
							'text': form_values.content,
							'doctype': doctype,
							'docname': docname,
							'printf': docname,
							'url': url_base64,
							'cc': form_values.cc,
							'bcc': form_values.bcc
								},
							callback(r) {
								if (me.frm) {
									me.frm.reload_doc();
								}
							}
							});
						}
					}
				))
		} else {
			frappe.call({
				method: 'newmatik.api.help_scout.send_email',
				args: {
					'subject': cur_dialog.fields_dict.subject.value,
					'reciever': cur_dialog.fields_dict.recipients.value,
					'mailbox': mailboxID,
					'text': form_values.content,
					'doctype': doctype,
					'docname': docname,
					'printf': docname,
					'url': selected_attachments,
					'cc': form_values.cc,
					'bcc': form_values.bcc
						},
					callback(r) {
						if (me.frm) {
							me.frm.reload_doc();
						}
					}
					});
		}
	}

	get_values() {
		const form_values = this.dialog.get_values();

		// cc
		for (let i = 0, l = this.dialog.fields.length; i < l; i++) {
			const df = this.dialog.fields[i];

			if (df.is_cc_checkbox) {
				// concat in cc
				if (form_values[df.fieldname]) {
					form_values.cc = ( form_values.cc ? (form_values.cc + ", ") : "" ) + df.fieldname;
					form_values.bcc = ( form_values.bcc ? (form_values.bcc + ", ") : "" ) + df.fieldname;
				}

				delete form_values[df.fieldname];
			}
		}

		return form_values;
	}

	save_as_draft() {
		const separator_element = '<div>---</div>';
		if (this.dialog && this.frm) {
			let message = this.dialog.get_value('content');
			message = message.split(separator_element)[0];
			localforage.setItem(this.frm.doctype + this.frm.docname, message).catch(e => {
				if (e) {
					// silently fail
					console.log(e); // eslint-disable-line
					console.warn('[Communication] IndexedDB is full. Cannot save message as draft'); // eslint-disable-line
				}
			});

		}
	}

	clear_cache() {
		this.delete_saved_draft();
		this.get_last_edited_communication(true);
	}

	get_last_edited_communication(clear) {
		if (!frappe.last_edited_communication[this.doctype]) {
			frappe.last_edited_communication[this.doctype] = {};
		}

		if (clear || !frappe.last_edited_communication[this.doctype][this.key]) {
			frappe.last_edited_communication[this.doctype][this.key] = {};
		}

		return frappe.last_edited_communication[this.doctype][this.key];
	}

	delete_saved_draft() {
		if (this.dialog && this.frm) {
			localforage.removeItem(this.frm.doctype + this.frm.docname).catch(e => {
				if (e) {
					// silently fail
					console.log(e); // eslint-disable-line
					console.warn('[Communication] IndexedDB is full. Cannot save message as draft'); // eslint-disable-line
				}
			});
		}
	}
	/*****************************/
	//helpscout to erpnext integration ends here
	/***************************/
	
	get_recipient() {
		if (this.frm.email_field) {
			return this.frm.doc[this.frm.email_field];
		} else {
			return this.frm.doc.email_id || this.frm.doc.email || "";
		}
	}

	setup_comment_actions(comment_wrapper, doc) {
		let edit_wrapper = $(`<div class="comment-edit-box">`).hide();
		let edit_box = this.make_editable(edit_wrapper);
		let content_wrapper = comment_wrapper.find('.content');

		let delete_button = $();
		if (frappe.model.can_delete("Comment") && (frappe.session.user == doc.owner || frappe.user.has_role("System Manager"))) {
			delete_button = $(`
				<button class="btn btn-link action-btn">
					${frappe.utils.icon('close', 'sm')}
				</button>
			`).click(() => this.delete_comment(doc.name));
		}

		let dismiss_button = $(`
			<button class="btn btn-link action-btn">
				${__('Dismiss')}
			</button>
		`).click(() => edit_button.toggle_edit_mode());
		dismiss_button.hide();

		edit_box.set_value(doc.content);

		edit_box.on_submit = (value) => {
			content_wrapper.empty();
			content_wrapper.append(value);
			edit_button.prop("disabled", true);
			edit_box.quill.enable(false);

			doc.content = value;
			this.update_comment(doc.name, value)
				.then(edit_button.toggle_edit_mode)
				.finally(() => {
					edit_button.prop("disabled", false);
					edit_box.quill.enable(true);
				});
		};

		content_wrapper.after(edit_wrapper);

		let edit_button = $();
		let current_user = frappe.session.user;
		if (['Administrator', doc.owner].includes(current_user)) {
			edit_button = $(`<button class="btn btn-link action-btn">${__("Edit")}</a>`).click(() => {
				edit_button.edit_mode ? edit_box.submit() : edit_button.toggle_edit_mode();
			});
		}

		edit_button.toggle_edit_mode = () => {
			edit_button.edit_mode = !edit_button.edit_mode;
			edit_button.text(edit_button.edit_mode ? __('Save') : __('Edit'));
			delete_button.toggle(!edit_button.edit_mode);
			dismiss_button.toggle(edit_button.edit_mode);
			edit_wrapper.toggle(edit_button.edit_mode);
			content_wrapper.toggle(!edit_button.edit_mode);
		};

		comment_wrapper.find('.actions').append(edit_button);
		comment_wrapper.find('.actions').append(dismiss_button);
		comment_wrapper.find('.actions').append(delete_button);
	}

	make_editable(container) {
		return frappe.ui.form.make_control({
			parent: container,
			df: {
				fieldtype: 'Comment',
				fieldname: 'comment',
				label: 'Comment'
			},
			enable_mentions: true,
			render_input: true,
			only_input: true,
			no_wrapper: true
		});
	}

	update_comment(name, content) {
		return frappe.xcall('frappe.desk.form.utils.update_comment', { name, content })
			.then(() => {
				frappe.utils.play_sound('click');
			});
	}

	get_last_email(from_recipient) {
		let last_email = null;
		let communications = this.frm.get_docinfo().communications || [];
		let email = this.get_recipient();
		// REDESIGN TODO: What is this? Check again
		(communications.sort((a, b) =>  a.creation > b.creation ? -1 : 1 )).forEach(c => {
			if (c.communication_type === 'Communication' && c.communication_medium === "Email") {
				if (from_recipient) {
					if (c.sender.indexOf(email)!==-1) {
						last_email = c;
						return false;
					}
				} else {
					last_email = c;
					return false;
				}
			}

		});

		return last_email;
	}

	delete_comment(comment_name) {
		frappe.confirm(__('Delete comment?'), () => {
			return frappe.xcall("frappe.client.delete", {
				doctype: "Comment",
				name: comment_name
			}).then(() => {
				frappe.utils.play_sound("delete");
			});
		});
	}
}

export default FormTimeline;
