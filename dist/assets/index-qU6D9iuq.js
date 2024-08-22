import{B,U as b,q as v,s as w,M as f,a as m,c as $,d as r,V as y,e as i,v as s,P as p,b as S,x as l,k as C,S as k}from"./index-CZmPgcIN.js";import{s as D}from"./index-oFI0niDC.js";import{s as I}from"./index-CVB4NKf8.js";import{s as g}from"./index-DFN8MQ6V.js";var z=function(n){var o=n.dt;return`
.p-splitbutton {
    display: inline-flex;
    position: relative;
    border-radius: `.concat(o("splitbutton.border.radius"),`;
}

.p-splitbutton-button {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    border-right: 0 none;
}

.p-splitbutton-button:focus-visible,
.p-splitbutton-dropdown:focus-visible {
    z-index: 1;
}

.p-splitbutton-button:not(:disabled):hover,
.p-splitbutton-button:not(:disabled):active {
    border-right: 0 none;
}

.p-splitbutton-dropdown {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
}

.p-splitbutton .p-menu {
    min-width: 100%;
}

.p-splitbutton-fluid {
    display: flex;
}

.p-splitbutton-rounded .p-splitbutton-dropdown {
    border-top-right-radius: `).concat(o("splitbutton.rounded.border.radius"),`;
    border-bottom-right-radius: `).concat(o("splitbutton.rounded.border.radius"),`;
}

.p-splitbutton-rounded .p-splitbutton-button {
    border-top-left-radius: `).concat(o("splitbutton.rounded.border.radius"),`;
    border-bottom-left-radius: `).concat(o("splitbutton.rounded.border.radius"),`;
}

.p-splitbutton-raised {
    box-shadow: `).concat(o("splitbutton.raised.shadow"),`;
}
`)},V={root:function(n){var o=n.instance,u=n.props;return["p-splitbutton p-component",{"p-splitbutton-raised":u.raised,"p-splitbutton-rounded":u.rounded,"p-splitbutton-fluid":o.hasFluid}]},pcButton:"p-splitbutton-button",pcDropdown:"p-splitbutton-dropdown"},Z=B.extend({name:"splitbutton",theme:z,classes:V}),E={name:"BaseSplitButton",extends:w,props:{label:{type:String,default:null},icon:{type:String,default:null},model:{type:Array,default:null},autoZIndex:{type:Boolean,default:!0},baseZIndex:{type:Number,default:0},appendTo:{type:[String,Object],default:"body"},disabled:{type:Boolean,default:!1},fluid:{type:Boolean,default:null},class:{type:null,default:null},style:{type:null,default:null},buttonProps:{type:null,default:null},menuButtonProps:{type:null,default:null},menuButtonIcon:{type:String,default:void 0},dropdownIcon:{type:String,default:void 0},severity:{type:String,default:null},raised:{type:Boolean,default:!1},rounded:{type:Boolean,default:!1},text:{type:Boolean,default:!1},outlined:{type:Boolean,default:!1},size:{type:String,default:null},plain:{type:Boolean,default:!1}},style:Z,provide:function(){return{$pcSplitButton:this,$parentInstance:this}}},P={name:"SplitButton",extends:E,inheritAttrs:!1,emits:["click"],inject:{$pcFluid:{default:null}},data:function(){return{id:this.$attrs.id,isExpanded:!1}},watch:{"$attrs.id":function(n){this.id=n||b()}},mounted:function(){var n=this;this.id=this.id||b(),this.$watch("$refs.menu.visible",function(o){n.isExpanded=o})},methods:{onDropdownButtonClick:function(n){n&&n.preventDefault(),this.$refs.menu.toggle({currentTarget:this.$el,relatedTarget:this.$refs.button.$el}),this.isExpanded=this.$refs.menu.visible},onDropdownKeydown:function(n){(n.code==="ArrowDown"||n.code==="ArrowUp")&&(this.onDropdownButtonClick(),n.preventDefault())},onDefaultButtonClick:function(n){this.isExpanded&&this.$refs.menu.hide(n),this.$emit("click",n)}},computed:{containerClass:function(){return[this.cx("root"),this.class]},hasFluid:function(){return v(this.fluid)?!!this.$pcFluid:this.fluid}},components:{PVSButton:I,PVSMenu:g,ChevronDownIcon:D}},T=["data-p-severity"];function F(t,n,o,u,a,d){var c=f("PVSButton"),h=f("PVSMenu");return m(),$("div",l({class:d.containerClass,style:t.style},t.ptmi("root"),{"data-p-severity":t.severity}),[r(c,l({type:"button",class:t.cx("pcButton"),label:t.label,disabled:t.disabled,severity:t.severity,text:t.text,icon:t.icon,outlined:t.outlined,size:t.size,fluid:t.fluid,"aria-label":t.label,onClick:d.onDefaultButtonClick},t.buttonProps,{pt:t.ptm("pcButton"),unstyled:t.unstyled}),y({default:i(function(){return[s(t.$slots,"default")]}),_:2},[t.$slots.icon?{name:"icon",fn:i(function(e){return[s(t.$slots,"icon",{class:p(e.class)},function(){return[S("span",l({class:[t.icon,e.class]},t.ptm("pcButton").icon,{"data-pc-section":"buttonicon"}),null,16)]})]}),key:"0"}:void 0]),1040,["class","label","disabled","severity","text","icon","outlined","size","fluid","aria-label","onClick","pt","unstyled"]),r(c,l({ref:"button",type:"button",class:t.cx("pcDropdown"),disabled:t.disabled,"aria-haspopup":"true","aria-expanded":a.isExpanded,"aria-controls":a.id+"_overlay",onClick:d.onDropdownButtonClick,onKeydown:d.onDropdownKeydown,severity:t.severity,text:t.text,outlined:t.outlined,size:t.size,unstyled:t.unstyled},t.menuButtonProps,{pt:t.ptm("pcDropdown")}),{icon:i(function(e){return[s(t.$slots,t.$slots.dropdownicon?"dropdownicon":"menubuttonicon",{class:p(e.class)},function(){return[(m(),C(k(t.menuButtonIcon||t.dropdownIcon?"span":"ChevronDownIcon"),l({class:[t.dropdownIcon||t.menuButtonIcon,e.class]},t.ptm("pcDropdown").icon,{"data-pc-section":"menubuttonicon"}),null,16,["class"]))]})]}),_:3},16,["class","disabled","aria-expanded","aria-controls","onClick","onKeydown","severity","text","outlined","size","unstyled","pt"]),r(h,{ref:"menu",id:a.id+"_overlay",model:t.model,popup:!0,autoZIndex:t.autoZIndex,baseZIndex:t.baseZIndex,appendTo:t.appendTo,unstyled:t.unstyled,pt:t.ptm("pcMenu")},y({_:2},[t.$slots.menuitemicon?{name:"itemicon",fn:i(function(e){return[s(t.$slots,"menuitemicon",{item:e.item,class:p(e.class)})]}),key:"0"}:void 0,t.$slots.item?{name:"item",fn:i(function(e){return[s(t.$slots,"item",{item:e.item,hasSubmenu:e.hasSubmenu,label:e.label,props:e.props})]}),key:"1"}:void 0]),1032,["id","model","autoZIndex","baseZIndex","appendTo","unstyled","pt"])],16,T)}P.render=F;export{P as s};
